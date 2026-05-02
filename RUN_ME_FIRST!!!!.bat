@echo off
echo ===================================================
echo   Installing Student Fashion Project Dependencies
echo ===================================================

:: 1. Install core dependencies
echo [1/3] Installing core packages...
call npm install

:: 2. Install specific Expo modules used in the project
echo [2/3] Installing Expo modules (Camera, FileSystem, Router)...
call npx expo install expo-camera expo-file-system expo-router expo-constants expo-linking expo-status-bar react-native-safe-area-context react-native-screens

:: 3. Install UI and Icon libraries
echo [3/3] Installing Lucide Icons...
call npm install lucide-react-native

echo ===================================================
echo   Installation Complete! 
echo   To start the project, type: npx expo start
echo ===================================================
pause