# Backend startup script for VS Code terminal
# Run from the project root or backend directory

$projectRoot = Split-Path -Parent $PSScriptRoot
$backendDir = Join-Path $projectRoot "backend"
$venvPython = Join-Path $backendDir ".venv\Scripts\python.exe"

# Ensure we're in the backend directory for proper .env loading
Set-Location $backendDir

# Start the FastAPI server with uvicorn
& $venvPython -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload