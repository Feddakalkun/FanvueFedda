@echo off
setlocal
cd /d %~dp0\..

echo Installing Node dependencies...
call npm install
if errorlevel 1 goto :fail

if exist prisma\schema.prisma (
  echo Preparing Prisma database...
  call npm run db:push
  if errorlevel 1 goto :fail
)

echo Setup completed.
exit /b 0

:fail
echo Setup failed. Check logs above.
exit /b 1
