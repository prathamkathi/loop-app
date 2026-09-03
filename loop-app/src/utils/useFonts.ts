import { useFonts, Outfit_400Regular, Outfit_600SemiBold, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { Geist_400Regular, Geist_600SemiBold } from '@expo-google-fonts/geist';

export function useCustomFonts() {
  return useFonts({
    Outfit_400Regular,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Geist_400Regular,
    Geist_600SemiBold,
  });
}
