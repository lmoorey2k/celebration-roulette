import { Linking, Platform } from 'react-native';

// Opens the restaurant's listing in Maps (ratings, photos, hours) rather than
// just dropping a pin on an address. Users can navigate from within Maps.
export function openListing(name: string, address: string): void {
  const query = encodeURIComponent(`${name} ${address}`);

  if (Platform.OS === 'ios') {
    // Apple Maps search — surfaces the business listing with ratings, hours, etc.
    Linking.openURL(`maps://?q=${query}`);
  } else {
    // Google Maps search — same result on Android and web
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  }
}

export function openWebsite(url: string): void {
  Linking.openURL(url);
}

export function googleMapsUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}
