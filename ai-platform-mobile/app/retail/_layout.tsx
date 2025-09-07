import { Stack } from 'expo-router';

export default function RetailLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="customer-service" />
      <Stack.Screen name="personalization" />
      <Stack.Screen name="inventory-optimization" />
      <Stack.Screen name="customer-journey" />
      <Stack.Screen name="sentiment-analysis" />
      <Stack.Screen name="omnichannel" />
      <Stack.Screen name="price-optimization" />
    </Stack>
  );
}