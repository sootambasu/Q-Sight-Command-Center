param (
    [string]$Tag
)

$ErrorActionPreference = "Stop"

# 1. Read default version from package.json if no override tag is provided
if (-not $Tag) {
    if (Test-Path "package.json") {
        try {
            $packageJson = Get-Content -Raw -Path "package.json" | ConvertFrom-Json
            $Tag = $packageJson.version
            Write-Host "Read version from package.json: $Tag" -ForegroundColor Cyan
        } catch {
            Write-Host "Failed to parse package.json: $_" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "package.json not found in current directory. Cannot read version." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Using override tag: $Tag" -ForegroundColor Cyan
}

# 2. Build API Image
Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host ">>> Building API Docker Image: q-sight-api:$Tag" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Context is root directory (.)
docker build -f apps/api/Dockerfile -t "q-sight-api:$Tag" .
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ API Docker build failed (Exit Code: $LASTEXITCODE)" -ForegroundColor Red
    exit 1
}
Write-Host "✅ API Docker image built successfully." -ForegroundColor Green

# 3. Build Web Image
Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host ">>> Building Web Docker Image: q-sight-web:$Tag" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

docker build -f apps/web/Dockerfile -t "q-sight-web:$Tag" .
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Web Docker build failed (Exit Code: $LASTEXITCODE)" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Web Docker image built successfully." -ForegroundColor Green

Write-Host "`n🎉 Docker version-tagging build completed: q-sight-api:$Tag and q-sight-web:$Tag" -ForegroundColor Green
exit 0
