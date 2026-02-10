# Start Django Server
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd server; ..\venv\Scripts\python manage.py runserver" -WindowStyle Minimized

# Start React Server
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd client; npm run dev" -WindowStyle Minimized

Write-Host "Servers started! Access the app at http://localhost:5173"
