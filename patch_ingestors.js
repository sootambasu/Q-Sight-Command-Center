const fs = require('fs');

function patchEarthquake() {
  const file = 'workers/earthquake-ingestor/src/index.ts';
  let data = fs.readFileSync(file, 'utf8');
  data = data.replace(
    'longitude,',
    'longitude,\n              source: result.source,\n              freshness: Date.now() - new Date(eventTime).getTime(),\n              age: Date.now() - new Date(eventTime).getTime(),\n              quality: result.source === \'live\' ? \'high\' : \'mock\',\n              staleness: false'
  );
  data = data.replace(
    'INSERT INTO seismic_events (usgs_id, place, magnitude, depth_km, event_time, location)',
    'INSERT INTO seismic_events (usgs_id, place, magnitude, depth_km, event_time, location, source, freshness, age, quality, staleness)'
  );
  data = data.replace(
    'VALUES ($1, $2, $3, $4, $5, ST_SetSRID(ST_MakePoint($6, $7), 4326))',
    'VALUES ($1, $2, $3, $4, $5, ST_SetSRID(ST_MakePoint($6, $7), 4326), $8, $9, $10, $11, $12)'
  );
  data = data.replace(
    'location = EXCLUDED.location;',
    'location = EXCLUDED.location,\n            source = EXCLUDED.source,\n            freshness = EXCLUDED.freshness,\n            age = EXCLUDED.age,\n            quality = EXCLUDED.quality,\n            staleness = EXCLUDED.staleness;'
  );
  data = data.replace(
    'event.latitude   // Y coordinate',
    'event.latitude,  // Y coordinate\n          event.source || \'live\',\n          event.freshness || 0,\n          event.age || 0,\n          event.quality || \'unknown\',\n          event.staleness || false'
  );
  fs.writeFileSync(file, data);
}

function patchOpensky() {
  const file = 'workers/opensky-ingestor/src/index.ts';
  let data = fs.readFileSync(file, 'utf8');
  data = data.replace(
    'last_contact: lastContact,',
    'last_contact: lastContact,\n              source: result.source,\n              freshness: Date.now() - (lastContact * 1000),\n              age: Date.now() - (lastContact * 1000),\n              quality: result.source === \'live\' ? \'high\' : \'mock\',\n              staleness: false'
  );
  data = data.replace(
    'INSERT INTO aircraft_positions (icao24, callsign, origin_country, altitude_meters, velocity_mps, heading_degrees, coordinates, last_contact)',
    'INSERT INTO aircraft_positions (icao24, callsign, origin_country, altitude_meters, velocity_mps, heading_degrees, coordinates, last_contact, source, freshness, age, quality, staleness)'
  );
  data = data.replace(
    'VALUES ($1, $2, $3, $4, $5, $6, ST_SetSRID(ST_MakePoint($7, $8, $9), 4326), to_timestamp($10))',
    'VALUES ($1, $2, $3, $4, $5, $6, ST_SetSRID(ST_MakePoint($7, $8, $9), 4326), to_timestamp($10), $11, $12, $13, $14, $15)'
  );
  data = data.replace(
    'last_contact = EXCLUDED.last_contact;',
    'last_contact = EXCLUDED.last_contact,\n            source = EXCLUDED.source,\n            freshness = EXCLUDED.freshness,\n            age = EXCLUDED.age,\n            quality = EXCLUDED.quality,\n            staleness = EXCLUDED.staleness;'
  );
  data = data.replace(
    'event.last_contact',
    'event.last_contact,\n          event.source || \'live\',\n          event.freshness || 0,\n          event.age || 0,\n          event.quality || \'unknown\',\n          event.staleness || false'
  );
  fs.writeFileSync(file, data);
}

function patchSatellite() {
  const file = 'workers/satellite-ingestor/src/index.ts';
  let data = fs.readFileSync(file, 'utf8');
  data = data.replace(
    'tle_line2: line2,',
    'tle_line2: line2,\n              source: result.source,\n              freshness: 0,\n              age: 0,\n              quality: result.source === \'live\' ? \'high\' : \'mock\',\n              staleness: false'
  );
  data = data.replace(
    'INSERT INTO satellite_orbits (norad_id, name, tle_line1, tle_line2)',
    'INSERT INTO satellite_orbits (norad_id, name, tle_line1, tle_line2, source, freshness, age, quality, staleness)'
  );
  data = data.replace(
    'VALUES ($1, $2, $3, $4)',
    'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)'
  );
  data = data.replace(
    'tle_line2 = EXCLUDED.tle_line2;',
    'tle_line2 = EXCLUDED.tle_line2,\n            source = EXCLUDED.source,\n            freshness = EXCLUDED.freshness,\n            age = EXCLUDED.age,\n            quality = EXCLUDED.quality,\n            staleness = EXCLUDED.staleness;'
  );
  data = data.replace(
    'event.tle_line2',
    'event.tle_line2,\n          event.source || \'live\',\n          event.freshness || 0,\n          event.age || 0,\n          event.quality || \'unknown\',\n          event.staleness || false'
  );
  fs.writeFileSync(file, data);
}

patchEarthquake();
patchOpensky();
patchSatellite();
