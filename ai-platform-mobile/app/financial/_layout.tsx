import { Stack } from 'expo-router';

export default function FinancialLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="algorithmic-trading" />
      <Stack.Screen name="risk-management" />
      <Stack.Screen name="compliance-monitoring" />
      <Stack.Screen name="portfolio-optimization" />
      <Stack.Screen name="fraud-detection" />
      <Stack.Screen name="client-onboarding" />
      <Stack.Screen name="regulatory-reporting" />
    </Stack>
  );
}