param (
    [switch]$IncludeDocker
)

$ErrorActionPreference = "Stop"

function Write-Header ($text) {
    Write-Host "`n==================================================" -ForegroundColor Cyan
    Write-Host ">>> $text" -ForegroundColor Cyan
    Write-Host "==================================================" -ForegroundColor Cyan
}

$summaryFile = "docs/audit/last-ci-verify-summary.md"
$results = [System.Collections.Generic.List[string]]::new()
$overallStatus = "PASS"

function Exit-With-Status ($code, $reason) {
    $date = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    if ($code -ne 0) {
        $global:overallStatus = "FAIL"
    }
    
    $summaryContent = @"
# Local CI Verification Summary
* **Timestamp**: $date
* **Overall Status**: $global:overallStatus
* **Docker Verification**: $(if ($IncludeDocker) { "Included" } else { "Skipped" })

## Execution Details
$( ($results -join "`n") )

$(if ($code -ne 0) { "## Failure Reason`n* $reason" })
"@
    
    $dir = Split-Path $summaryFile
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    $summaryContent | Out-File -FilePath $summaryFile -Encoding utf8
    
    Write-Host "`nCI Verification Finished with Status: $global:overallStatus"
    exit $code
}

function Run-Command ($cmd, $argsList) {
    Write-Host "Running: $cmd $argsList" -ForegroundColor Yellow
    if ($cmd -eq "npm.cmd") {
        # Using cmd.exe /c ensures npm.cmd is invoked cleanly under Windows PowerShell
        & cmd.exe /c "npm $argsList"
    } else {
        & $cmd $argsList
    }
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Command failed: $cmd $argsList (Exit Code: $LASTEXITCODE)" -ForegroundColor Red
        Exit-With-Status 1 "Command failed: $cmd $argsList (Exit Code: $LASTEXITCODE)"
    }
    Write-Host "✅ Command completed successfully." -ForegroundColor Green
}

try {
    Write-Header "Step 1: Building workspaces"
    $results.Add("* Workspaces Build: RUNNING")
    Run-Command "npm.cmd" "run build"
    $results[$results.Count-1] = "* Workspaces Build: PASS"

    Write-Header "Step 2: Running workspace typechecks"
    $results.Add("* Typechecks: RUNNING")
    Run-Command "npm.cmd" "run typecheck"
    $results[$results.Count-1] = "* Typechecks: PASS"

    Write-Header "Step 3: Building web application"
    $results.Add("* Web Application Build: RUNNING")
    Run-Command "npm.cmd" "run build:web"
    $results[$results.Count-1] = "* Web Application Build: PASS"

    Write-Header "Step 4: Running static verification suite"
    $results.Add("* Static Verification Suite: RUNNING")
    Run-Command "npm.cmd" "run verify:static"
    $results[$results.Count-1] = "* Static Verification Suite: PASS"

    Write-Header "Step 5: Verifying WebSocket integration"
    $results.Add("* WebSocket Verification: RUNNING")
    Run-Command "node" "scripts/ws_verify.js"
    $results[$results.Count-1] = "* WebSocket Verification: PASS"

    Write-Header "Step 6: Running safety guardrails scanner"
    $results.Add("* Safety Guardrails Scanner: RUNNING")
    Run-Command "node" "scripts/verify_safety_guardrails.js"
    $results[$results.Count-1] = "* Safety Guardrails Scanner: PASS"

    Write-Header "Step 7: Running safety verify command alias"
    $results.Add("* Safety Verify Alias: RUNNING")
    Run-Command "npm.cmd" "run safety:verify"
    $results[$results.Count-1] = "* Safety Verify Alias: PASS"

    if ($IncludeDocker) {
        Write-Header "Step 8 (Docker): Building pilot Docker staging images"
        $results.Add("* Docker Staging Build: RUNNING")
        Run-Command "npm.cmd" "run pilot:docker:build"
        $results[$results.Count-1] = "* Docker Staging Build: PASS"

        Write-Header "Step 9 (Docker): Verifying Docker Compose prototype config"
        $results.Add("* Docker Compose Config Check: RUNNING")
        Run-Command "docker-compose" "-f infra/docker-compose.prototype.yml config"
        $results[$results.Count-1] = "* Docker Compose Config Check: PASS"
    }

    Write-Host "`n🎉 All checks passed successfully!" -ForegroundColor Green
    Exit-With-Status 0 "All checks passed"

} catch {
    Write-Host "An unexpected error occurred during CI validation: $_" -ForegroundColor Red
    $results.Add("* Unexpected Exception: $_")
    Exit-With-Status 1 $_
}
