import { Redirect } from 'expo-router';
import { useWindowDimensions } from 'react-native';
import { View, Text } from 'react-native';

export default function Index() {
  const { width } = useWindowDimensions();

  // Adjust breakpoint to match your design system (e.g., >1023px = desktop/tablet)
  const isLargeScreen = width > 1023;

  if (isLargeScreen) {
    // Web/desktop → straight to login
    return <Redirect href="/login" />;
  }

  // Mobile → go to splash first
  return <Redirect href="/splash" />;
}