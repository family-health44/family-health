// supabase/functions/delete-user/index.ts
// Deletes the calling user's account and all associated data.
// - If the user is the sole member of their family group, deletes the group
//   (all data cascades via FK constraints).
// - If other members remain, removes only this user's membership.
// - Finally deletes the auth user via the admin API.
// Requires: Authorization: Bearer <access_token> header from the app.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ── 1. Verify the caller's JWT and get their user ID ──────────────────────
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // User-scoped client — validates the JWT and gives us the user identity
    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = user.id;

    // Admin client — service role, used only after identity is confirmed above
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // ── 2. Find ALL of this user's family group memberships ───────────────────
    // A user may transiently have >1 membership (interrupted onboarding that
    // created duplicate groups). Handle every one — .maybeSingle() threw
    // PGRST116 on 2 rows and 500'd the whole delete.
    const { data: memberships, error: membershipError } = await adminClient
      .from('family_group_members')
      .select('id, family_group_id')
      .eq('user_id', userId);

    if (membershipError) {
      console.error('Membership lookup error:', membershipError);
      return new Response(JSON.stringify({ error: 'Failed to look up membership' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    for (const membership of memberships ?? []) {
      // ── 3a. Count other members in the same group ─────────────────────────
      const { count, error: countError } = await adminClient
        .from('family_group_members')
        .select('id', { count: 'exact', head: true })
        .eq('family_group_id', membership.family_group_id);

      if (countError) {
        console.error('Member count error:', countError);
        return new Response(JSON.stringify({ error: 'Failed to count members' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (count === 1) {
        // ── 3b. Sole member — delete the whole family group (cascades all data)
        const { error: groupDeleteError } = await adminClient
          .from('family_groups')
          .delete()
          .eq('id', membership.family_group_id);

        if (groupDeleteError) {
          console.error('Family group delete error:', groupDeleteError);
          return new Response(JSON.stringify({ error: 'Failed to delete family group' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      } else {
        // ── 3c. Other members remain — remove only this membership ────────────
        const { error: memberDeleteError } = await adminClient
          .from('family_group_members')
          .delete()
          .eq('id', membership.id);

        if (memberDeleteError) {
          console.error('Membership delete error:', memberDeleteError);
          return new Response(JSON.stringify({ error: 'Failed to remove membership' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
    }
    // If no membership found, still proceed to delete the auth user below.

    // ── 4. Delete the auth user (must be last — invalidates the JWT) ─────────
    const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(userId);
    if (deleteUserError) {
      console.error('Auth user delete error:', deleteUserError);
      return new Response(JSON.stringify({ error: 'Failed to delete auth user' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
