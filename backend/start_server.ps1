# Backend startup script for VS Code terminal
# Run from the project root or backend directory

$projectRoot = Split-Path -Parent $PSScriptRoot
$backendDir = Join-Path $projectRoot "backend"
$venvPython = Join-Path $backendDir ".venv\Scripts\python.exe"

# Ensure we're in the backend directory for proper .env loading
Set-Location $backendDir

# Read PORT from environment (Render sets this), default to 8000 for local dev
$port = $env:PORT
if ([string]::IsNullOrWhiteSpace($port)) { $port = 8000 }

# Bind to 0.0.0.0 for production; disable reload in production
$reload = $env:ENVIRONMENT -ne "production"

# Start the FastAPI server with uvicorn
& $venvPython -m uvicorn main:app --host 0.0.0.0 --port $port -Reload:$reload