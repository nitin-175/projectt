@echo off
cd /d "E:\Project\Booking platform\apps\backend"
"C:\Program Files\Microsoft\jdk-17.0.18.8-hotspot\bin\java.exe" -Dspring.profiles.active=mysql -jar "E:\Project\Booking platform\apps\backend\target\backend-0.1.0.jar" 1>> "E:\Project\Booking platform\.codex-logs\backend-stdout.log" 2>> "E:\Project\Booking platform\.codex-logs\backend-stderr.log"
