@echo off
REM Start Ollama server for MediBuddy
REM Make sure to install Ollama first: https://ollama.com/download

echo.
echo 🦙 Starting Ollama server for MediBuddy...
echo.

echo Pulling required model: phi3:mini
ollama pull phi3:mini

echo Launching Ollama server
ollama serve

if errorlevel 1 (
    echo.
    echo ❌ Error: Ollama not found!
    echo.
    echo To fix:
    echo 1. Install Ollama from: https://ollama.com/download
    echo 2. Restart your computer
    echo 3. Try again
    echo.
    pause
)
