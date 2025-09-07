import { Stack } from 'expo-router';

export default function EducationLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="personalized-learning" />
      <Stack.Screen name="robot-manager" />
      <Stack.Screen name="campus-management" />
      <Stack.Screen name="assessment-engine" />
      <Stack.Screen name="student-analytics" />
      <Stack.Screen name="behavioral-learning" />
      <Stack.Screen name="multi-language" />
    </Stack>
  );
}