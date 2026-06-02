// app/index.tsx
// Root redirect — sends users to sign-in on app launch.
import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/(auth)/sign-in" />;
}
