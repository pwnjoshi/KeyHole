# ==============================================================================
# Keyhole Automated 1-Click CI/CD Deployment Script
# Automates Git push -> AWS CodeBuild container compilation -> AWS App Runner rollout
# ==============================================================================

param(
    [string]$CommitMessage = "deploy: update Keyhole gateway and dashboard"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host ">>> [Keyhole Deployer] Starting 1-click CI/CD deployment..." -ForegroundColor Cyan

# 1. Verify and Build Locally First
Write-Host "1/5 Verifying local production build..." -ForegroundColor Yellow
npm run build:prod
if ($LASTEXITCODE -ne 0) {
    Write-Host "Local build verification failed! Aborting deployment." -ForegroundColor Red
    exit 1
}
Write-Host "Local build passed cleanly!" -ForegroundColor Green

# 2. Git Commit and Push
Write-Host ""
Write-Host "2/5 Pushing latest code to GitHub..." -ForegroundColor Yellow
git add .
$status = git status --porcelain
if ($status) {
    git commit -m "$CommitMessage"
} else {
    Write-Host "No unstaged changes; pushing current HEAD." -ForegroundColor Gray
}
git push origin main
Write-Host "Pushed to GitHub main branch!" -ForegroundColor Green

# 3. Trigger AWS CodeBuild
Write-Host ""
Write-Host "3/5 Triggering AWS CodeBuild (Container compilation and ECR push)..." -ForegroundColor Yellow
$buildJson = aws codebuild start-build --project-name keyhole-builder --region us-east-1 --profile cloudblueprint | ConvertFrom-Json
$buildId = $buildJson.build.id
$buildNumber = $buildJson.build.buildNumber
Write-Host "   Build #$buildNumber started ($buildId)" -ForegroundColor Gray

# Wait for CodeBuild to finish
while ($true) {
    Start-Sleep -Seconds 8
    $buildStatusJson = aws codebuild batch-get-builds --ids $buildId --region us-east-1 --profile cloudblueprint | ConvertFrom-Json
    $status = $buildStatusJson.builds[0].buildStatus
    $currentPhase = $buildStatusJson.builds[0].currentPhase
    Write-Host "   [CodeBuild #$buildNumber] Phase: $currentPhase | Status: $status" -ForegroundColor Gray
    
    if ($status -eq "SUCCEEDED") {
        Write-Host "CodeBuild #$buildNumber SUCCEEDED! Container pushed to ECR." -ForegroundColor Green
        break
    } elseif ($status -eq "FAILED" -or $status -eq "FAULT" -or $status -eq "STOPPED") {
        Write-Host "CodeBuild failed with status $status!" -ForegroundColor Red
        exit 1
    }
}

# 4. Trigger AWS App Runner Deployment
Write-Host ""
Write-Host "4/5 Triggering AWS App Runner rollout..." -ForegroundColor Yellow
$serviceArn = "arn:aws:apprunner:us-east-1:013131247228:service/keyhole-gateway/802d49a3dc3149da8604f25e681bfa47"

# Check if an operation is currently in progress, wait for it to reach RUNNING first
while ($true) {
    $svc = aws apprunner describe-service --service-arn $serviceArn --region us-east-1 --profile cloudblueprint | ConvertFrom-Json
    if ($svc.Service.Status -eq "RUNNING") {
        break
    }
    Write-Host "   Waiting for previous App Runner operation to complete ($($svc.Service.Status))..." -ForegroundColor Gray
    Start-Sleep -Seconds 10
}

$deployJson = aws apprunner start-deployment --service-arn $serviceArn --region us-east-1 --profile cloudblueprint | ConvertFrom-Json
$operationId = $deployJson.OperationId
Write-Host "   App Runner rollout started (Operation: $operationId)" -ForegroundColor Cyan

# Poll App Runner until it finishes and returns to RUNNING
while ($true) {
    Start-Sleep -Seconds 12
    $svc = aws apprunner describe-service --service-arn $serviceArn --region us-east-1 --profile cloudblueprint | ConvertFrom-Json
    $svcStatus = $svc.Service.Status
    Write-Host "   [App Runner] Service Status: $svcStatus..." -ForegroundColor Gray
    
    if ($svcStatus -eq "RUNNING") {
        Write-Host "AWS App Runner rolling update completed!" -ForegroundColor Green
        break
    } elseif ($svcStatus -eq "OPERATION_IN_PROGRESS") {
        continue
    } else {
        Write-Host "App Runner status: $svcStatus" -ForegroundColor Yellow
        break
    }
}

# 5. Live Production Health Check
Write-Host ""
Write-Host "5/5 Verifying live domain health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "https://keyhole.techsangi.com.np/api/health" -Method Get -TimeoutSec 10
    Write-Host ""
    Write-Host "[DEPLOYMENT SUCCESSFUL - 100% LIVE]" -ForegroundColor Green
    Write-Host "   Domain: https://keyhole.techsangi.com.np" -ForegroundColor Cyan
    Write-Host "   Status: $($health.status)" -ForegroundColor White
    Write-Host "   Version: $($health.version)" -ForegroundColor White
    Write-Host "   Midnight Network: $($health.midnightNetwork)" -ForegroundColor White
    Write-Host "   Registered Connectors: $($health.connectorsRegistered -join ', ')" -ForegroundColor White
} catch {
    Write-Host "Health check timed out or failed, please inspect App Runner logs." -ForegroundColor Yellow
}
