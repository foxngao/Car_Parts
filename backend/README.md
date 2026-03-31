# Car Parts Backend

## Runtime Layout

The backend now uses a monolithic Express bootstrap split into:

- `app.js`: Express app assembly (middleware, routes, error handling)
- `bin/www`: HTTP server startup entrypoint
- `server.js`: compatibility shim that exports `app` and delegates to `bin/www` when executed directly

Current domain modules remain under `src/` in this task branch:

- `src/routes/`
- `src/controllers/`
- `src/models/`
- `src/config/`

Runtime uploads are served from `uploads/`.

## Local Startup Commands

- Development: `npm run dev` (nodemon with `bin/www`)
- Production-like local run: `npm start` (node `bin/www`)
- Tests: `npm test`

## Docker Startup Commands

- Build and run stack: `docker compose up --build -d`
- Check status: `docker compose ps`
- App module load probe:
  - `docker compose exec app node -e "require('./app'); console.log('app-load-ok')"`
- In-container HTTP probe:
  - `docker compose exec app node -e "const http=require('http'); http.get('http://127.0.0.1:3000/',res=>{console.log('status',res.statusCode); process.exit(res.statusCode===200?0:1);})"`
