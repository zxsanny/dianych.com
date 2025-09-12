setlocal enabledelayedexpansion
@echo off
set CURRENT_DIR=%cd%
cd /d %~dp0

cd ./dianych-website
docker build -t docker.azaion.com/dianych .
docker login docker.azaion.com
docker push docker.azaion.com/dianych

cd /d %CURRENT_DIR%
echo Done!