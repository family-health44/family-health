# EAS Build Setup

Run these commands once to connect the project to EAS:

```bash
# 1. Install EAS CLI globally
npm install -g eas-cli

# 2. Log in to your Expo account (create one free at expo.dev if needed)
eas login

# 3. Link this project to EAS (generates projectId)
eas init

# 4. Set production secrets — these are stored encrypted on EAS servers
#    Never put real values in eas.json or app.config.ts
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "your-supabase-url"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your-anon-key"

# 5. Trigger a development build for iOS simulator
eas build --platform ios --profile development

# 6. Trigger a preview build for internal testing
eas build --platform ios --profile preview
```

## Profile summary

| Profile | Use case | Distribution |
|---|---|---|
| development | Local dev with hot reload | Internal (simulator) |
| preview | Internal testing / TestFlight | Internal |
| production | App Store submission | Store |

## GitHub Actions

Add these secrets to your GitHub repo (Settings → Secrets → Actions):
- `EXPO_TOKEN` — from expo.dev → Account Settings → Access Tokens

The workflow will:
- Run type check + lint on every PR
- Run unit tests on every PR
- Trigger a preview EAS build on every push to `main`
