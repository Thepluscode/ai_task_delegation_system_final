import { Stack } from 'expo-router';

export default function LogisticsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="warehouse-management" />
      <Stack.Screen name="route-optimization" />
      <Stack.Screen name="automated-sorting" />
      <Stack.Screen name="fleet-management" />
      <Stack.Screen name="demand-forecasting" />
      <Stack.Screen name="cross-docking" />
      <Stack.Screen name="returns-processing" />
    </Stack>
  );
}