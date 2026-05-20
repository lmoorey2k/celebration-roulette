import { Linking, Platform } from 'react-native';

function isIOSDevice(): boolean {
  if (Platform.OS === 'ios') return true;
  if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }
  return false;
}

// Opens the restaurant's listing in Maps (ratings, photos, hours) rather than
// just dropping a pin on an address. Users can navigate from within Maps.
// On iOS (native or web), uses maps:// so the device's default maps app opens.
export function openListing(name: string, address: string): void {
  const query = encodeURIComponent(`${name} ${address}`);

  if (isIOSDevice()) {
    // maps:// opens the user's default maps app on iOS (Apple Maps, Google Maps, Waze, etc.)
    Linking.openURL(`maps://?q=${query}`);
  } else {
    // Google Maps search for Android and desktop web
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  }
}

export function openWebsite(url: string): void {
  Linking.openURL(url);
}

export function googleMapsUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}
