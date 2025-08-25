import { Stack } from 'expo-router';

export default function RestockSessionsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Restock Sessions',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="add-product"
        options={{
          title: 'Add Product',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
