import { Stack } from 'expo-router';
import { MenuProvider } from 'react-native-popup-menu';

export default function RootLayout() {
  return (
    <MenuProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </MenuProvider>
  );
}