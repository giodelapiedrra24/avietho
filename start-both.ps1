# PowerShell script to start both frontend and backend

# Function to check if a command exists
function Test-Command($command) {
    $oldPreference = $ErrorActionPreference
    $ErrorActionPreference = 'stop'
    try {
        if (Get-Command $command) { return $true }
    } catch {
        return $false
    } finally {
        $ErrorActionPreference = $oldPreference
    }
}

# Check if required commands exist
if (-not (Test-Command npm)) {
    Write-Host "Error: npm is not installed or not in your PATH" -ForegroundColor Red
    exit 1
}

# Set the paths to the frontend and backend directories
$frontendPath = Join-Path -Path $PSScriptRoot -ChildPath "frontend"
$backendPath = Join-Path -Path $PSScriptRoot -ChildPath "backend"

# Verify directories exist
if (-not (Test-Path $frontendPath)) {
    Write-Host "Error: frontend directory not found at $frontendPath" -ForegroundColor Red
    exit 1
}
if (-not (Test-Path $backendPath)) {
    Write-Host "Error: backend directory not found at $backendPath" -ForegroundColor Red
    exit 1
}

# Start the backend in a new PowerShell window
Write-Host "Starting backend server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; npm run dev"

# Start the frontend in a new PowerShell window
Write-Host "Starting frontend application..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm start"

Write-Host "Both applications have been started in separate windows." -ForegroundColor Cyan
Write-Host "Backend is running on http://localhost:5000" -ForegroundColor Yellow
Write-Host "Frontend is running on http://localhost:3000" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to exit this script, but note that the applications will continue running in their windows." -ForegroundColor Magenta 