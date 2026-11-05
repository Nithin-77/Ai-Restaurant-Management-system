# Frontend startup script for VS Code terminal
# Run from the project root or frontend directory

$projectRoot = Split-Path -Parent $PSScriptRoot
$frontendDir = Join-Path $projectRoot "frontend"

# Ensure we're in the frontend directory
Set-Location $frontendDir

# Start the Vite dev server
npm run dev