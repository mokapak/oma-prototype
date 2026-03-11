@echo off
cd /d "%~dp0"
echo Saving OMA prototype to GitHub...
git add .
git commit -m "Save %date% %time:~0,5%"
git push
echo.
echo Done!
pause
