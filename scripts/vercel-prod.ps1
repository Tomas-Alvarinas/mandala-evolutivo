# Production deploy that does not depend on the daily `vercel login` OAuth
# session (~12h) or on an expired VERCEL_OIDC_TOKEN from Cursor / `vercel link`.

$ErrorActionPreference = "Stop"

function Remove-VercelOidcFromEnvFile {
  param([string]$Path)

  if (-not (Test-Path $Path)) {
    return
  }

  $lines = Get-Content -Path $Path
  $kept = $lines | Where-Object { $_ -notmatch '^\s*VERCEL_OIDC_TOKEN\s*=' }
  if ($kept.Count -ne $lines.Count) {
    Set-Content -Path $Path -Value $kept -Encoding utf8
    Write-Host "Sacado VERCEL_OIDC_TOKEN de $Path (caduca ~12 h y rompe el deploy)."
  }
}

$projectJson = Join-Path (Get-Location) ".vercel\project.json"
if (-not (Test-Path $projectJson)) {
  Write-Host "Falta .vercel/project.json. El repo no esta linkeado."
  Write-Host "No corras vercel link salvo que haga falta: reescribe .env.local."
  exit 1
}

$link = Get-Content $projectJson -Raw | ConvertFrom-Json
$orgId = $link.orgId
$projectName = $link.projectName

if ([string]::IsNullOrWhiteSpace($orgId)) {
  Write-Host "orgId ausente en .vercel/project.json"
  exit 1
}

Remove-VercelOidcFromEnvFile (Join-Path (Get-Location) ".env.local")
Remove-Item Env:VERCEL_OIDC_TOKEN -ErrorAction SilentlyContinue

$userToken = [Environment]::GetEnvironmentVariable("VERCEL_TOKEN", "User")
if ([string]::IsNullOrWhiteSpace($userToken)) {
  $userToken = $env:VERCEL_TOKEN
}

$userToken = if ($userToken) {
  [regex]::Replace($userToken.Trim().Trim("'").Trim('"'), "\p{C}+", "").Trim()
} else {
  ""
}

if ([string]::IsNullOrWhiteSpace($userToken)) {
  Write-Host "No hay VERCEL_TOKEN de usuario. El OAuth de vercel login caduca ~12 h."
  Write-Host "Una sola vez: npm run deploy:setup"
  Write-Host "Pega el token con clic derecho, no con Ctrl+V."
  exit 1
}

$stored = [Environment]::GetEnvironmentVariable("VERCEL_TOKEN", "User")
if ($stored -ne $userToken) {
  [Environment]::SetEnvironmentVariable("VERCEL_TOKEN", $userToken, "User")
}

$env:VERCEL_TOKEN = $userToken

Write-Host "Deploy produccion: $projectName (scope $orgId)"
vercel --prod --yes --scope $orgId
