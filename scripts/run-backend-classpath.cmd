@echo off
cd /d "E:\Project\Booking platform\apps\backend"
"C:\Program Files\Microsoft\jdk-17.0.18.8-hotspot\bin\java.exe" -Dspring.profiles.active=mysql -cp "E:\Project\Booking platform\apps\backend\target\classes;E:\Project\Booking platform\apps\backend\target\runtime-libs\*" com.showbooking.backend.ShowBookingApplication 1>> "E:\Project\Booking platform\.codex-logs\backend-stdout.log" 2>> "E:\Project\Booking platform\.codex-logs\backend-stderr.log"
