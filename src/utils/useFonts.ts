import { useFonts } from 'expo-font';
import { Outfit_600SemiBold } from '@expo-google-fonts/outfit/600SemiBold';
import { Geist_400Regular } from '@expo-google-fonts/geist/400Regular';

export function useCustomFonts() {
  return useFonts({
    Outfit_600SemiBold,
    Geist_400Regular,
  });
}
