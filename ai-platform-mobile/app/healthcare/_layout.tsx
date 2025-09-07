import { Stack } from 'expo-router';

export default function HealthcareLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="patient-flow" />
      <Stack.Screen name="social-robots" />
      <Stack.Screen name="fall-detection" />
      <Stack.Screen name="cognitive-assessment" />
      <Stack.Screen name="medication-reminders" />
      <Stack.Screen name="emergency-response" />
      <Stack.Screen name="multi-language" />
    </Stack>
  );
}