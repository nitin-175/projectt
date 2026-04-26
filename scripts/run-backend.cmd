@echo off
cd /d "E:\Project\Booking platform\apps\backend"
"C:\Program Files\Apache\apache-maven-3.9.14\bin\mvn.cmd" -o -Dmaven.repo.local="E:\Project\Booking platform\.m2\repository" spring-boot:run "-Dspring-boot.run.profiles=mysql" 1>> "E:\Project\Booking platform\.codex-logs\backend-stdout.log" 2>> "E:\Project\Booking platform\.codex-logs\backend-stderr.log"
