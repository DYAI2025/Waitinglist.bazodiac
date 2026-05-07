// Geocoding + timezone provider boundary.
//
// The shape of the upstream vendor (Mapbox, Google, OpenCage, etc.) is not
// finalized — this module is a generic boundary that can be swapped per
// vendor without touching the service or route layers. Stub mode returns
// null and lets the service layer fall back to fixture-backed responses.
import { configurationError, fufireUnavailable } from '../errors.mjs';

export async function resolveLocation({ birthPlace, providedTimezone, config, fetchImpl = fetch }) {
  if (config.stubMode) return null;
  if (!config.geocoding.url) throw configurationError('GEOCODING_API_URL is not set.');
  if (!config.timezone.url) throw configurationError('TIMEZONE_API_URL is not set.');

  let coords;
  try {
    const geocodeUrl = new URL(config.geocoding.url);
    geocodeUrl.searchParams.set('q', birthPlace);
    const headers = config.geocoding.apiKey
      ? { authorization: `Bearer ${config.geocoding.apiKey}` }
      : {};
    const res = await fetchImpl(geocodeUrl, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.json();
    coords = extractCoords(body);
  } catch (err) {
    throw fufireUnavailable(`Geocoding failed: ${err.message}`);
  }
  if (!coords) throw fufireUnavailable('Geocoding returned no coordinates.');

  if (providedTimezone) {
    return { ...coords, timezone: providedTimezone };
  }

  let timezone;
  try {
    const tzUrl = new URL(config.timezone.url);
    tzUrl.searchParams.set('lat', String(coords.geo_lat_deg));
    tzUrl.searchParams.set('lon', String(coords.geo_lon_deg));
    const headers = config.timezone.apiKey
      ? { authorization: `Bearer ${config.timezone.apiKey}` }
      : {};
    const res = await fetchImpl(tzUrl, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.json();
    timezone = body?.timeZoneId || body?.timezone || body?.zoneName || null;
  } catch (err) {
    throw fufireUnavailable(`Timezone lookup failed: ${err.message}`);
  }
  if (!timezone) throw fufireUnavailable('Timezone lookup returned no zone.');

  return { ...coords, timezone };
}

function extractCoords(body) {
  if (!body) return null;
  // Common vendor shapes: { lat, lng } | { latitude, longitude } | { results: [{ geometry: { lat, lng } }] }
  const candidate =
    body.geometry || body.results?.[0]?.geometry || body.location || body;
  const lat = candidate.lat ?? candidate.latitude;
  const lon = candidate.lng ?? candidate.lon ?? candidate.longitude;
  if (typeof lat !== 'number' || typeof lon !== 'number') return null;
  return { geo_lat_deg: lat, geo_lon_deg: lon };
}
