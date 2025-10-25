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
      <Stack.Screen
        name="edit-product"
        options={{
          title: 'Edit Product',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="session-list"
        options={{
          title: 'Session List',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="upload-catalog"
        options={{
          title: 'Upload Catalog',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
