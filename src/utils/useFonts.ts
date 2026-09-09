import { useFonts } from 'expo-font';
import { Manrope_600SemiBold, Manrope_700Bold } from '@expo-google-fonts/manrope';
import { DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';

export function useCustomFonts() {
  return useFonts({
    Manrope_600SemiBold,
    Manrope_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });
}
