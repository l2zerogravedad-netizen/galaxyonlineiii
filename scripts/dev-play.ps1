# Arranque rápido — versión mínima jugable
$ErrorActionPreference = "Stop"
$npm = "$env:ProgramFiles\nodejs\npm.cmd"
$root = Split-Path $PSScriptRoot -Parent

Set-Location $root
if (-not (Test-Path ".env")) {
  Copy-Item ".env.example" ".env"
  Write-Host "Creado .env — configura DATABASE_URL antes de registrar jugadores."
}

$env:DEV_CHEAP_COSTS = "true"
$env:DEV_FAST_TIMERS = "true"
$env:NEXT_PUBLIC_API_URL = "http://localhost:3001"

Write-Host "API http://localhost:3001 | Web http://localhost:3000"
Write-Host "Ejecuta en dos terminales:"
Write-Host "  npm run dev:api"
Write-Host "  npm run dev:web"
