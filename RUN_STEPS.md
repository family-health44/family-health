# Native batch — run steps (Codespaces)

Batch contents: A8 date/time pickers · Documents feature · Info Card PDF share.
All JS/TS changes are already in the repo tree you cloned; the steps below add the
native deps, verify, and prep the build.

## 1. Install native deps (in Codespaces, repo root)

```bash
npx expo install \
  @react-native-community/datetimepicker \
  expo-document-picker \
  expo-image-picker \
  expo-print \
  expo-sharing
npm install base64-arraybuffer
```

`expo install` picks the SDK-55-correct versions. `base64-arraybuffer` is a plain
npm dep (not an Expo module), hence `npm install`.

## 2. Run the SQL (Supabase → SQL editor)

Open `documents_storage.sql`. Run the **READ-ONLY VERIFY block first** (section 0)
and eyeball the columns. If they match, run the rest. It creates:
- private `documents` storage bucket (10 MB/file)
- storage RLS (family-group isolation by path prefix)
- documents-table RLS (family-group)
- 50 MB per-family cap trigger

Nothing references or mutates the Smith group.

## 3. Verify (gate before build)

```bash
npx tsc --noEmit
npx jest
```

Both must pass. (I typechecked the pure domain logic here; the full tsc pass needs
your node_modules.)

## 4. Build

This is a **native** batch (new modules + Info.plist strings) → needs a real EAS
build, not OTA. Requires paid EAS (F1). `buildNumber` is already bumped to `2`.

```bash
eas build --platform ios --profile production
```

Then submit to TestFlight, then invite testers.

---

## Flags to resolve before building (see chat)

1. **Bundle ID mismatch.** `app.config.js` has `com.familyhealthapp.ios`, but the
   project notes say `com.rowan44.familyhealth`. Confirm which matches your App
   Store Connect record before building — a wrong bundle ID blocks submission.
   (The Android `package` also reuses the iOS id, worth tidying.)
2. **Rename-on-upload** was left at the default (store original filename). Say if
   you want a rename step.

## What ships where

- A8 pickers, PDF share, Documents UI logic → could *mostly* be OTA, BUT the new
  native modules (datetimepicker, pickers, print, sharing) require a rebuild. So
  the whole batch goes in this one native build. After it's live, future JS-only
  fixes to these screens can OTA via `eas update`.
