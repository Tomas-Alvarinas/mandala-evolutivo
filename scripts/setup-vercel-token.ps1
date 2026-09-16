# One-time: store a long-lived Vercel token in the Windows user environment.
# Do not put the token in .env.local or in this repo.
# Create it at https://vercel.com/account/tokens
#   Scope: Full Account (the CLI calls GET /v2/user; team/project tokens 404)
#   Expiration: 1 year or no expiration — not the 12h OAuth from `vercel login`.

$ErrorActionPreference = "Stop"

$tokensUrl = "https://vercel.com/account/tokens"

Write-Host ""
Write-Host "Se va a abrir la pagina de tokens de Vercel."
Write-Host "Crea un token con alcance Full Account."
Write-Host "No elijas equipo ni un proyecto: la CLI pide /v2/user y esos tokens dan 404."
Write-Host "Elegi vencimiento de 1 ano o sin vencimiento."
Write-Host "Copialo UNA vez. Pega con clic derecho, no con Ctrl+V."
Write-Host "No lo pegues en el chat ni en .env.local."
Write-Host ""

Start-Process $tokensUrl

$secure = Read-Host "Pega el token (clic derecho, no Ctrl+V)" -AsSecureString
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
try {
  $token = [Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
} finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
}

if ([string]::IsNullOrWhiteSpace($token)) {
  Write-Host "No se guardo ningun token."
  exit 1
}

$token = $token.Trim().Trim("'").Trim('"')
$token = [regex]::Replace($token, "\p{C}+", "")
$token = $token.Trim()

if ([string]::IsNullOrWhiteSpace($token)) {
  Write-Host "El pegado solo trajo caracteres de control (tipico de Ctrl+V)."
  Write-Host "Volve a correr npm run deploy:setup y pega con clic derecho."
  exit 1
}

[Environment]::SetEnvironmentVariable("VERCEL_TOKEN", $token, "User")
$env:VERCEL_TOKEN = $token
Remove-Item Env:VERCEL_OIDC_TOKEN -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Token guardado en el entorno de usuario de Windows (VERCEL_TOKEN)."
Write-Host "Las terminales ya abiertas no lo ven hasta que las cierres."
Write-Host "npm run deploy:prod lo lee directo, incluso en esta sesion."
Write-Host ""
