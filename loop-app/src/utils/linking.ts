import { Linking, Platform, Alert } from 'react-native';

/**
 * Open external URL reliably across Web, iOS, and Android.
 */
export async function openExternalLink(url: string): Promise<void> {
  if (!url) return;

  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      if (url.startsWith('tel:') || url.startsWith('mailto:')) {
        window.location.href = url;
      } else {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
      return;
    }

    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      await Linking.openURL(url);
    }
  } catch (err) {
    console.error(`Failed to open URL "${url}":`, err);
    if (url.startsWith('tel:')) {
      const phoneNumber = url.replace('tel:', '');
      Alert.alert('Phone Number', `Contact: ${phoneNumber}`);
    } else {
      Alert.alert('Unable to open link', `Could not navigate to ${url}`);
    }
  }
}

/**
 * Open Instagram profile from a username or handle.
 */
export function openInstagram(handle: string): Promise<void> {
  const clean = handle.replace('@', '').trim();
  return openExternalLink(`https://www.instagram.com/${clean}/`);
}

/**
 * Open Google Maps search location.
 */
export function openMaps(query: string): Promise<void> {
  return openExternalLink(
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
  );
}
