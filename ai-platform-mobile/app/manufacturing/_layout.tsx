import { Stack } from 'expo-router';

export default function ManufacturingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="production-line" />
      <Stack.Screen name="quality-control" />
      <Stack.Screen name="oee-monitoring" />
      <Stack.Screen name="predictive-maintenance" />
      <Stack.Screen name="lean-manufacturing" />
      <Stack.Screen name="digital-twin" />
      <Stack.Screen name="supply-chain" />
    </Stack>
  );
}