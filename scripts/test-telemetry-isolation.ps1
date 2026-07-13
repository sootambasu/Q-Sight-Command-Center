$env:LIVE_INGESTION_ENABLED = 'true'
$env:SEISMIC_LIVE_ENABLED = 'true'
$env:AIRCRAFT_LIVE_ENABLED = 'true'
$env:SATELLITE_LIVE_ENABLED = 'true'
$env:BUILD_PROFILE = 'production'
$env:SEISMIC_SOURCE_URL = ''
$env:AIRCRAFT_SOURCE_URL = ''
$env:SATELLITE_TLE_SOURCE_URL = ''
$env:DATABASE_URL = ''

Write-Host "Running Telemetry Isolation Tests..."

$outEq = npx tsx workers/earthquake-ingestor/src/index.ts 2>&1
if ($outEq -match 'Mock fallback BLOCKED in production' -and $outEq -match '"count":0') {
    Write-Host "PASS: Earthquake ingestor blocked mock data in production"
} else {
    Write-Host "FAIL: Earthquake ingestor did not block mock data. Output: $outEq"
    exit 1
}

$outOs = npx tsx workers/opensky-ingestor/src/index.ts 2>&1
if ($outOs -match 'Mock fallback BLOCKED in production' -and $outOs -match '"count":0') {
    Write-Host "PASS: OpenSky ingestor blocked mock data in production"
} else {
    Write-Host "FAIL: OpenSky ingestor did not block mock data. Output: $outOs"
    exit 1
}

$outSat = npx tsx workers/satellite-ingestor/src/index.ts 2>&1
if ($outSat -match 'Mock fallback BLOCKED in production' -and $outSat -match '"count":0') {
    Write-Host "PASS: Satellite ingestor blocked mock data in production"
} else {
    Write-Host "FAIL: Satellite ingestor did not block mock data. Output: $outSat"
    exit 1
}

Write-Host "All telemetry isolation tests passed."
