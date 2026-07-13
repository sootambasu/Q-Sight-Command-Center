function patchImport($file, $mockVar, $mockFile) {
  $data = Get-Content $file -Raw
  $importLine = "import { $mockVar } from '$mockFile';"
  $replacement = "let $mockVar : any[] = [];
if (process.env.BUILD_PROFILE !== 'production') {
  $mockVar = require('$mockFile').$mockVar;
}"
  $data = $data.Replace($importLine, $replacement)
  Set-Content -Path $file -Value $data
}
patchImport 'workers/earthquake-ingestor/src/index.ts' 'mockSeismicEvents' './mock-data'
patchImport 'workers/opensky-ingestor/src/index.ts' 'mockAircrafts' './mock-data'
patchImport 'workers/satellite-ingestor/src/index.ts' 'mockSatellites' './mock-data'
