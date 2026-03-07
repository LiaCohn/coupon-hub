# Setup Notes

## One-Command Deployment

This project is designed for **maximum ease of use** for evaluators and testers.

### Design Decision: npm install vs npm ci

**We use `npm install` in Dockerfiles (not `npm ci`) intentionally.**

**Why?**
- ✅ **True one-command setup**: `docker-compose up --build` just works
- ✅ **No manual steps**: No need to run `npm install` locally first
- ✅ **Self-contained**: Everything needed is in the Docker containers
- ✅ **Evaluator-friendly**: Clone and run - nothing else needed

**Trade-off:**
- Package versions may vary slightly between builds
- For this exercise/demo project, ease of use > perfect version locking

**For Production:**
- Generate `package-lock.json` files
- Switch back to `npm ci` for reproducible builds
- Commit lock files to version control

## Testing Instructions

From a fresh clone:

```bash
# That's it - just one command!
docker-compose up --build

# Access the application:
# - Frontend: http://localhost
# - Admin: http://localhost/admin
# - Backend API: http://localhost:3000
```

**First build**: 3-5 minutes (downloads images, installs dependencies)
**Subsequent builds**: ~30 seconds (uses cache)

## What Gets Installed

### Backend Dependencies
- express, pg, bcrypt, cors, dotenv
- express-validator, uuid
- TypeScript and development tools

### Frontend Dependencies
- react, react-dom, react-router-dom
- axios for API calls
- Vite for building
- TypeScript and development tools

All dependencies are installed automatically during the Docker build process.

## Verification

After services start, verify everything works:

```bash
# Check health
curl http://localhost:3000/health

# Or use the test script
chmod +x test-api.sh
./test-api.sh
```

## No Additional Setup Required

Unlike some projects that require:
- ❌ Running `npm install` locally
- ❌ Generating lock files
- ❌ Setting up databases manually
- ❌ Running migrations separately

This project does **everything automatically** in Docker.

---

**Bottom line**: Clone, run `docker-compose up --build`, wait ~5 minutes, and you have a fully functional application!
