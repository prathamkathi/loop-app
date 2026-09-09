import { Linking, Platform } from 'react-native';
import { showAlert } from './alert';

/**
 * Open external URL reliably across Web, iOS, and Android.
 */
export async function openExternalLink(url: string): Promise<void> {
  if (!url) return;
  if (!/^(https?:\/\/|tel:|mailto:)/i.test(url.trim())) {
    showAlert('Invalid link', 'This link is not a supported web, email or telephone address.');
    return;
  }

  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      if (url.startsWith('tel:') || url.startsWith('mailto:')) {
        window.location.href = url;
      } else {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
      return;
    }

    await Linking.openURL(url);
  } catch (err) {
    console.error(`Failed to open URL "${url}":`, err);
    if (url.startsWith('tel:')) {
      const phoneNumber = url.replace('tel:', '');
      showAlert('Phone Number', `Contact: ${phoneNumber}`);
    } else {
      showAlert('Unable to open link', `Could not navigate to ${url}`);
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

export function openWhatsApp(rawPhone: string, name: string, eventTitle: string): Promise<void> {
  let phone = rawPhone.replace(/[^\d]/g, '');
  if (phone.startsWith('00')) phone = phone.slice(2);
  if (phone.length === 11 && phone.startsWith('0')) phone = phone.slice(1);
  if (phone.length === 10) phone = '91' + phone;
  if (!/^[1-9]\d{9,14}$/.test(phone)) {
    showAlert('Contact unavailable', 'The organizer has not provided a valid phone number.');
    return Promise.resolve();
  }
  const message = encodeURIComponent('Hi ' + (name || 'Organizer') + ', I saw "' + eventTitle + '" on Loop IITD and had a query.');
  return openExternalLink('https://wa.me/' + phone + '?text=' + message);
}

/**
 * Open Google Maps search location.
 */
export function openMaps(query: string): Promise<void> {
  return openExternalLink(
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
  );
}
