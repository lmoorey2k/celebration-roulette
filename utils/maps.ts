import { Linking, Platform } from 'react-native';

function isIOSDevice(): boolean {
  if (Platform.OS === 'ios') return true;
  if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }
  return false;
}

// Opens a turn-by-turn directions intent with the current location implied as
// the origin. This removes the extra "search/listing first" step for users.
export function openListing(name: string, address: string): void {
  const destination = encodeURIComponent(`${name} ${address}`);

  if (isIOSDevice()) {
    // On iOS, Apple Maps treats daddr as the destination and uses the user's
    // current location by default when no origin is provided.
    Linking.openURL(`maps://?daddr=${destination}&dirflg=d`);
  } else {
    // Google Maps directions on Android and web with origin left implicit.
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`);
  }
}

export function openWebsite(url: string): void {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const opened = window.open(url, '_blank', 'noopener,noreferrer');
    if (!opened) window.location.href = url;
    return;
  }

  Linking.openURL(url);
}

export function googleMapsUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}
