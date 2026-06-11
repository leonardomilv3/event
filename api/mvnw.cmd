@REM Apache Maven Wrapper — version 3.3.2
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.
@echo off

set MAVEN_PROJECTBASEDIR=%~dp0

if not exist "%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.properties" (
  echo ERROR: .mvn\wrapper\maven-wrapper.properties not found
  exit /b 1
)

for /f "tokens=2 delims==" %%A in ('findstr /r "^distributionUrl" "%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.properties"') do set DISTRIBUTION_URL=%%A

for %%A in ("%DISTRIBUTION_URL%") do set DISTRIBUTION_ID=%%~nA

set MAVEN_HOME=%USERPROFILE%\.m2\wrapper\dists\%DISTRIBUTION_ID%\%DISTRIBUTION_ID%

if not exist "%MAVEN_HOME%\bin\mvn.cmd" (
  echo Downloading Maven: %DISTRIBUTION_URL%
  set DOWNLOAD_TO=%MAVEN_HOME%\..\%DISTRIBUTION_ID%.zip
  mkdir "%MAVEN_HOME%\.." 2>nul
  powershell -Command "Invoke-WebRequest -Uri '%DISTRIBUTION_URL%' -OutFile '%DOWNLOAD_TO%'"
  powershell -Command "Expand-Archive -Path '%DOWNLOAD_TO%' -DestinationPath '%MAVEN_HOME%\..' -Force"
  del "%DOWNLOAD_TO%"
)

"%MAVEN_HOME%\bin\mvn.cmd" %*
