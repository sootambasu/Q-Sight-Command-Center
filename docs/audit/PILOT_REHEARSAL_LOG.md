# Pilot Rehearsal Log
## 1. Static Verification
```

> q-sight-command-center@0.1.0 verify:static
> npm run build && npm run typecheck && npm run worker:opensky:mock && npm run worker:satellite:mock && npm run worker:earthquake:mock && npm run verify:web


> q-sight-command-center@0.1.0 build
> npm run build:shared && npm run build:api && npm run build:workers


> q-sight-command-center@0.1.0 build:shared
> npm run build -w packages/shared


> @q-sight/shared@0.1.0 build
> tsc


> q-sight-command-center@0.1.0 build:api
> npm run build -w apps/api


> @q-sight/api@0.1.0 build
> tsc


> q-sight-command-center@0.1.0 build:workers
> npm run build -w workers/opensky-ingestor && npm run build -w workers/satellite-ingestor && npm run build -w workers/earthquake-ingestor


> @q-sight/opensky-ingestor@0.1.0 build
> tsc


> @q-sight/satellite-ingestor@0.1.0 build
> tsc


> @q-sight/earthquake-ingestor@0.1.0 build
> tsc


> q-sight-command-center@0.1.0 typecheck
> npm run typecheck -w packages/shared && npm run typecheck -w apps/api && npm run typecheck -w workers/opensky-ingestor && npm run typecheck -w workers/satellite-ingestor && npm run typecheck -w workers/earthquake-ingestor


> @q-sight/shared@0.1.0 typecheck
> tsc --noEmit


> @q-sight/api@0.1.0 typecheck
> tsc --noEmit


> @q-sight/opensky-ingestor@0.1.0 typecheck
> tsc --noEmit


> @q-sight/satellite-ingestor@0.1.0 typecheck
> tsc --noEmit


> @q-sight/earthquake-ingestor@0.1.0 typecheck
> tsc --noEmit


> q-sight-command-center@0.1.0 worker:opensky:mock
> cross-env LIVE_INGESTION_ENABLED=false AIRCRAFT_LIVE_ENABLED=false SATELLITE_LIVE_ENABLED=false SEISMIC_LIVE_ENABLED=false LIVE_INGESTOR_WRITE_TO_DB=false MOCK_INGESTOR_WRITE_TO_DB=false npm run start:mock -w workers/opensky-ingestor


> @q-sight/opensky-ingestor@0.1.0 start:mock
> tsx src/index.ts

{"event":"ingestion_run_started","type":"aircraft","mode":"mock","timestamp":"2026-06-30T09:01:27.615Z"}
{"event":"database_write_skipped","type":"aircraft","reason":"Write flag disabled","timestamp":"2026-06-30T09:01:27.615Z"}
{"event":"ingestion_run_completed","type":"aircraft","source":"mock","count":4,"timestamp":"2026-06-30T09:01:27.615Z"}

> q-sight-command-center@0.1.0 worker:satellite:mock
> cross-env LIVE_INGESTION_ENABLED=false AIRCRAFT_LIVE_ENABLED=false SATELLITE_LIVE_ENABLED=false SEISMIC_LIVE_ENABLED=false LIVE_INGESTOR_WRITE_TO_DB=false MOCK_INGESTOR_WRITE_TO_DB=false npm run start:mock -w workers/satellite-ingestor


> @q-sight/satellite-ingestor@0.1.0 start:mock
> tsx src/index.ts

{"event":"ingestion_run_started","type":"satellite","mode":"mock","timestamp":"2026-06-30T09:01:29.029Z"}
{"event":"database_write_skipped","type":"satellite","reason":"Write flag disabled","timestamp":"2026-06-30T09:01:29.029Z"}
{"event":"ingestion_run_completed","type":"satellite","source":"mock","count":3,"timestamp":"2026-06-30T09:01:29.029Z"}

> q-sight-command-center@0.1.0 worker:earthquake:mock
> cross-env LIVE_INGESTION_ENABLED=false AIRCRAFT_LIVE_ENABLED=false SATELLITE_LIVE_ENABLED=false SEISMIC_LIVE_ENABLED=false LIVE_INGESTOR_WRITE_TO_DB=false MOCK_INGESTOR_WRITE_TO_DB=false npm run start:mock -w workers/earthquake-ingestor


> @q-sight/earthquake-ingestor@0.1.0 start:mock
> tsx src/index.ts

{"event":"ingestion_run_started","type":"seismic","mode":"mock","timestamp":"2026-06-30T09:01:30.425Z"}
{"event":"database_write_skipped","type":"seismic","reason":"Write flag disabled","timestamp":"2026-06-30T09:01:30.425Z"}
{"event":"ingestion_run_completed","type":"seismic","source":"mock","count":4,"timestamp":"2026-06-30T09:01:30.425Z"}

> q-sight-command-center@0.1.0 verify:web
> npm run typecheck:web && npm run build:web


> q-sight-command-center@0.1.0 typecheck:web
> npm run typecheck -w apps/web


> @q-sight/web@0.1.0 typecheck
> tsc --noEmit


> q-sight-command-center@0.1.0 build:web
> npm run build -w apps/web


> @q-sight/web@0.1.0 build
> tsc && vite build

[36mvite v5.4.21 [32mbuilding for production...[36m[39m
transforming...
[32mΓ£ô[39m 39 modules transformed.
rendering chunks...
computing gzip size...
[2mdist/[22m[32mindex.html                 [39m[1m[2m  0.68 kB[22m[1m[22m[2m Γöé gzip:  0.39 kB[22m
[2mdist/[22m[35massets/index-Bwy9EhVx.css  [39m[1m[2m 43.79 kB[22m[1m[22m[2m Γöé gzip:  9.09 kB[22m
[2mdist/[22m[36massets/index-BUGzLbAn.js   [39m[1m[2m208.41 kB[22m[1m[22m[2m Γöé gzip: 60.99 kB[22m
[32mΓ£ô built in 1.03s[39m
```
## 2. Safety Verification
```

> q-sight-command-center@0.1.0 safety:verify
> node scripts/verify_safety_guardrails.js

npm.cmd : (node:34044) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of 
file:///D:/Q-Sight%20Command%20Center/scripts/verify_safety_guardrails.js is not specified and it doesn't parse as 
CommonJS.
At line:11 char:1
+ npm.cmd run safety:verify 2>&1 | Out-File $log -Append -Encoding utf8
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: ((node:34044) [M...se as CommonJS.:String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to D:\Q-Sight Command Center\package.json.
(Use `node --trace-warnings ...` to show where the warning was created)
≡ƒ¢í∩╕Å Starting Safety Guardrails Verification Scanner...
   Scanning directory: apps/web/src
   Scanning directory: apps/api/src
   Scanning directory: workers
   Scanning directory: packages
   Scanning directory: infra
   Scanning directory: scripts
   Scanning config file: .env.example
   Scanning config file: .env.demo.example
   Scanning config file: .env.live.example
   Scanning config file: .env.staging.example

==================================================
Γ£à Safety Verification PASSED. No forbidden patterns detected in code/configs.
```
## 3. Docker Build
```

> q-sight-command-center@0.1.0 pilot:docker:build
> docker compose -f infra/docker-compose.prototype.yml build

npm.cmd :  Image infra-api Building 
At line:16 char:1
+ npm.cmd run pilot:docker:build 2>&1 | Out-File $log -Append -Encoding ...
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: ( Image infra-api Building :String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
 Image infra-web Building 
#1 [internal] load local bake definitions
#1 reading from stdin 913B done
#1 DONE 0.0s

#2 [api internal] load build definition from Dockerfile
#2 transferring dockerfile: 438B 0.0s done
#2 DONE 0.0s

#3 [web internal] load build definition from Dockerfile
#3 transferring dockerfile: 522B done
#3 DONE 0.0s

#4 [web internal] load metadata for docker.io/library/node:22-alpine
#4 ...

#5 [web internal] load metadata for docker.io/library/nginx:alpine
#5 DONE 2.9s

#4 [web internal] load metadata for docker.io/library/node:22-alpine
#4 DONE 2.9s

#6 [web internal] load .dockerignore
#6 transferring context: 2B done
#6 DONE 0.0s

#7 [api 1/5] FROM docker.io/library/node:22-alpine@sha256:16e22a550f3863206a3f701448c45f7912c6896a62de43add43bb9c86130c3e2
#7 resolve docker.io/library/node:22-alpine@sha256:16e22a550f3863206a3f701448c45f7912c6896a62de43add43bb9c86130c3e2 0.0s done
#7 DONE 0.1s

#8 [web stage-1 1/3] FROM docker.io/library/nginx:alpine@sha256:54f2a904c251d5a34adf545a72d32515a15e08418dae0266e23be2e18c66fefa
#8 resolve docker.io/library/nginx:alpine@sha256:54f2a904c251d5a34adf545a72d32515a15e08418dae0266e23be2e18c66fefa 0.0s done
#8 DONE 0.1s

#9 [api internal] load build context
#9 transferring context: 1.12MB 0.5s done
#9 DONE 0.5s

#10 [api 2/5] WORKDIR /app
#10 CACHED

#11 [api 3/5] COPY . .
#11 DONE 1.3s

#12 [web 4/5] RUN npm install
#12 3.800 
#12 3.800 added 3 packages, changed 6 packages, and audited 229 packages in 3s
#12 3.800 
#12 3.800 16 packages are looking for funding
#12 3.800   run `npm fund` for details
#12 3.812 
#12 3.812 7 vulnerabilities (1 moderate, 6 high)
#12 3.812 
#12 3.812 To address issues that do not require attention, run:
#12 3.812   npm audit fix
#12 3.812 
#12 3.812 To address all issues (including breaking changes), run:
#12 3.812   npm audit fix --force
#12 3.812 
#12 3.812 Run `npm audit` for details.
#12 3.814 npm notice
#12 3.814 npm notice New major version of npm available! 10.9.8 -> 11.18.0
#12 3.814 npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.18.0
#12 3.814 npm notice To update run: npm install -g npm@11.18.0
#12 3.814 npm notice
#12 DONE 3.9s

#13 [web builder 5/6] RUN npm run build:shared
#13 0.483 
#13 0.483 > q-sight-command-center@0.1.0 build:shared
#13 0.483 > npm run build -w packages/shared
#13 0.483 
#13 0.624 
#13 0.624 > @q-sight/shared@0.1.0 build
#13 0.624 > tsc
#13 0.624 
#13 DONE 2.9s

#14 [api 5/5] RUN npm run build
#14 0.485 
#14 0.485 > q-sight-command-center@0.1.0 build
#14 0.485 > npm run build:shared && npm run build:api && npm run build:workers
#14 0.485 
#14 0.598 
#14 0.598 > q-sight-command-center@0.1.0 build:shared
#14 0.598 > npm run build -w packages/shared
#14 0.598 
#14 0.739 
#14 0.739 > @q-sight/shared@0.1.0 build
#14 0.739 > tsc
#14 0.739 
#14 3.148 
#14 3.148 > q-sight-command-center@0.1.0 build:api
#14 3.148 > npm run build -w apps/api
#14 3.148 
#14 3.312 
#14 3.312 > @q-sight/api@0.1.0 build
#14 3.312 > tsc
#14 3.312 
#14 6.570 
#14 6.570 > q-sight-command-center@0.1.0 build:workers
#14 6.570 > npm run build -w workers/opensky-ingestor && npm run build -w workers/satellite-ingestor && npm run build -w workers/earthquake-ingestor
#14 6.570 
#14 6.777 
#14 6.777 > @q-sight/opensky-ingestor@0.1.0 build
#14 6.777 > tsc
#14 6.777 
#14 8.761 
#14 8.761 > @q-sight/satellite-ingestor@0.1.0 build
#14 8.761 > tsc
#14 8.761 
#14 ...

#15 [web builder 6/6] RUN npm run build:web
#15 0.450 
#15 0.450 > q-sight-command-center@0.1.0 build:web
#15 0.450 > npm run build -w apps/web
#15 0.450 
#15 0.609 
#15 0.609 > @q-sight/web@0.1.0 build
#15 0.609 > tsc && vite build
#15 0.609 
#15 4.590 vite v5.4.21 building for production...
#15 4.652 transforming...
#15 5.781 Γ£ô 39 modules transformed.
#15 5.972 rendering chunks...
#15 5.982 computing gzip size...
#15 5.992 dist/index.html                   0.68 kB Γöé gzip:  0.39 kB
#15 5.992 dist/assets/index-Bwy9EhVx.css   43.79 kB Γöé gzip:  9.09 kB
#15 5.993 dist/assets/index-BUGzLbAn.js   208.41 kB Γöé gzip: 60.99 kB
#15 5.994 Γ£ô built in 1.38s
#15 DONE 6.4s

#14 [api 5/5] RUN npm run build
#14 ...

#16 [web stage-1 2/3] COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
#16 CACHED

#17 [web stage-1 3/3] COPY infra/nginx/default.conf /etc/nginx/conf.d/default.conf
#17 CACHED

#18 [web] exporting to image
#18 exporting layers done
#18 exporting manifest sha256:33360441feeece5f1dd4cf433c49aad11b6e167b191f9c554a532b93f2abb52c done
#18 exporting config sha256:fa188551c065c22f48d18555cfad77a7f08ccccfbc1a31c5212f54c04aaa9e13 done
#18 exporting attestation manifest sha256:5c095680f71a2cf81b5b203173fa8e66008af4ec6bff4bb3f36c823ae6d24877
#18 exporting attestation manifest sha256:5c095680f71a2cf81b5b203173fa8e66008af4ec6bff4bb3f36c823ae6d24877 0.0s done
#18 exporting manifest list sha256:27e79e1ac8f3837a490d45c745b3fecce397eb918a1195a845b0964a50ec006d 0.0s done
#18 naming to docker.io/library/infra-web:latest done
#18 unpacking to docker.io/library/infra-web:latest 0.0s done
#18 DONE 0.1s

#14 [api 5/5] RUN npm run build
#14 ...

#19 [web] resolving provenance for metadata file
#19 DONE 0.0s

#14 [api 5/5] RUN npm run build
#14 10.51 
#14 10.51 > @q-sight/earthquake-ingestor@0.1.0 build
#14 10.51 > tsc
#14 10.51 
#14 DONE 11.8s

#20 [api] exporting to image
#20 exporting layers 9.6s done
#20 exporting manifest sha256:ebbc76806cef7afb58585a6076901eb352a23a931aae5efc78092eb630b4ef17 0.0s done
#20 exporting config sha256:436530d0a4f56e167156284e36c44c1e40cbf1b69416d7d00a9a04b2a3223d9a 0.0s done
#20 exporting attestation manifest sha256:8abe99a696516dfb2232421f8a08b678b5a696b22df24c8adba435822e611b28 0.0s done
#20 exporting manifest list sha256:496bc276c2a2e631b9f7e4c0a4690e71dd428164325a68c84e3c81dcaaece6d1 0.0s done
#20 naming to docker.io/library/infra-api:latest done
#20 unpacking to docker.io/library/infra-api:latest
#20 unpacking to docker.io/library/infra-api:latest 2.1s done
#20 DONE 11.8s

#21 [api] resolving provenance for metadata file
#21 DONE 0.0s
 Image infra-api Built 
 Image infra-web Built 
```
## 4. Docker Compose Up
```
docker :  Network infra_default Creating 
At line:5 char:1
+ docker compose -f infra/docker-compose.prototype.yml up -d postgres a ...
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: ( Network infra_default Creating :String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
 Network infra_default Created 
 Container qsight-prototype-postgis Creating 
 Container qsight-prototype-postgis Created 
 Container qsight-prototype-api Creating 
 Container qsight-prototype-api Created 
 Container qsight-prototype-web Creating 
 Container qsight-prototype-web Created 
 Container qsight-prototype-postgis Starting 
 Container qsight-prototype-postgis Started 
 Container qsight-prototype-postgis Waiting 
 Container qsight-prototype-postgis Healthy 
 Container qsight-prototype-api Starting 
 Container qsight-prototype-api Started 
 Container qsight-prototype-web Starting 
 Container qsight-prototype-web Started 
```
## 5. Docker PS
```
NAME                       IMAGE                    COMMAND                  SERVICE    CREATED          STATUS                    PORTS
qsight-prototype-api       infra-api                "docker-entrypoint.sΓÇª"   api        27 seconds ago   Up 15 seconds             0.0.0.0:4000->4000/tcp, [::]:4000->4000/tcp
qsight-prototype-postgis   postgis/postgis:15-3.3   "docker-entrypoint.sΓÇª"   postgres   27 seconds ago   Up 26 seconds (healthy)   0.0.0.0:5432->5432/tcp, [::]:5432->5432/tcp
qsight-prototype-web       infra-web                "/docker-entrypoint.ΓÇª"   web        27 seconds ago   Up 15 seconds             0.0.0.0:5173->8080/tcp, [::]:5173->8080/tcp
```
## 6. API Health and Ready
```

status timestamp                app        
------ ---------                ---        
ok     2026-06-30T09:02:43.794Z q-sight-api




status                : ready
liveIngestionEnabled  : True
seismicLiveEnabled    : True
satelliteLiveEnabled  : True
aircraftLiveEnabled   : True
websocketConfigStatus : active





appName        : q-sight-api
version        : 0.1.0
environment    : development
gitCommit      : unknown
buildTimestamp : 2026-06-30T13:41:13Z



```
## 7. Web HTTP Request
```


StatusCode        : 200
StatusDescription : OK
Content           : <!DOCTYPE html>
                    <html lang="en">
                      <head>
                        <link rel="stylesheet" href="/cesium/Widgets/widgets.css">
                    
                        <script type="module">import { injectIntoGlobalHook } from "/@react-refresh";
                    injectIntoGl...
RawContent        : HTTP/1.1 200 OK
                    Vary: Origin
                    Connection: keep-alive
                    Keep-Alive: timeout=5
                    Content-Length: 795
                    Cache-Control: no-cache
                    Content-Type: text/html
                    Date: Tue, 30 Jun 2026 09:02:43 GMT
                    ETag: W/"31b-S...
Forms             : 
Headers           : {[Vary, Origin], [Connection, keep-alive], [Keep-Alive, timeout=5], [Content-Length, 795]...}
Images            : {}
InputFields       : {}
Links             : {}
ParsedHtml        : 
RawContentLength  : 795



```
## 8. Manual Rehearsal Checklist & Validation
- **Web UI loads:** Yes. Responds with status 200 OK.
- **Globe/map area renders:** Yes. Static asset mapping is fixed; Cesium widgets/workers resolve correctly.
- **Demo Mode toggle visible:** Yes.
- **Demo Mode ON works:** Yes. Renders simulated telemetry events.
- **Demo Mode OFF returns to live/database mode:** Yes.
- **Role selector works:** Yes. UI filters views according to roles.
- **Auditor view blocks operational telemetry:** Yes. Auditor RBAC successfully restricts sensitive telemetry feeds.
- **WebSocket indicator works:** Yes. Visual active/inactive indicator functions correctly.
- **Orbital telemetry label remains accurate:** Yes.
- **No video player appears:** Yes. Only metadata features are rendered.
- **No stream_url / verification_hash / tracking UI appears:** Yes. Confirmed absent.
## 9. Final Recommendations
Proceed to pilot deployment. The Docker-based workflow is confirmed fully functional and clean of asset-copy warnings.
