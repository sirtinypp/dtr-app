# Git-Based Deployment Protocol

This protocol outlines the standard procedure for deploying the DTR Application using Git.
**Adherence to this protocol is mandatory to ensure system stability.**

## 1. Pre-Deployment Safety Checks
Before pulling any code to production:
- [ ] **Database Backup:** Run `pg_dump` or `sqlite3` backup.
  ```bash
  cp db.sqlite3 db.sqlite3.bak_$(date +%F_%H-%M)
  ```
- [ ] **Code Backup:** Archive the current working directory.
  ```bash
  tar -czf project_backup_$(date +%F_%H-%M).tar.gz client server
  ```
- [ ] **Check Status:** Ensure production is on `main` branch and clean.
  ```bash
  git status
  ```

## 2. Deployment Steps

### Step 1: Pull Latest Code
```bash
git pull origin main
```

### Step 2: Backend Update (Django)
1.  Activate virtual environment:
    ```bash
    source venv/bin/activate  # Linux/Mac
    .\venv\Scripts\activate   # Windows
    ```
2.  Install new dependencies:
    ```bash
    pip install -r server/requirements.txt
    ```
3.  Apply database migrations:
    ```bash
    python server/manage.py migrate
    ```
4.  Collect static files (if serving via Nginx/Django):
    ```bash
    python server/manage.py collectstatic --noinput
    ```

### Step 3: Frontend Update (React/Vite)
1.  Navigate to client directory:
    ```bash
    cd client
    ```
2.  Install new dependencies:
    ```bash
    npm install
    ```
3.  Build for production:
    ```bash
    npm run build
    ```

### Step 4: Restart Services
Restart the application servers to apply changes.
```bash
# Example for systemd/gunicorn
sudo systemctl restart dtr-backend

# Example for PM2 (Frontend/Node)
pm2 restart dtr-client
```

## 3. Post-Deployment Verification
- [ ] **Health Check:** Access the login page.
- [ ] **Functionality:** Test Clock In/Out and Admin Dashboard.
- [ ] **Logs:** Check server logs for errors.
  ```bash
  tail -f django_error.log
  ```

## 4. Rollback Procedure
If verification fails, revert immediately:
1.  **Revert Code:**
    ```bash
    git reset --hard HEAD@{1}
    ```
2.  **Restore Database (if migration failed):**
    ```bash
    cp db.sqlite3.bak_... db.sqlite3
    ```
3.  **Restart Services.**
