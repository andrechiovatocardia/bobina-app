import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="historico" options={{ headerShown: false }} />
      <Stack.Screen name="minhasbobinas" options={{ headerShown: false }} />
    </Stack>
  );
}