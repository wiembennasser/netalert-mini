const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const path = require("node:path");

const PORT = 3101;
const BASE_URL = `http://127.0.0.1:${PORT}`;
let server;

before(async () => {
  server = spawn(
    process.execPath,
    [path.join(__dirname, "..", "server.js")],
    {
      cwd: path.join(__dirname, ".."),
      env: { ...process.env, PORT: String(PORT) },
      stdio: "ignore"
    }
  );

  for (let attempt = 0; attempt < 50; attempt++) {
    if (server.exitCode !== null) {
      throw new Error("Le serveur NetAlert s'est arrêté au démarrage.");
    }

    try {
      const response = await fetch(`${BASE_URL}/health`, {
        signal: AbortSignal.timeout(500)
      });

      if (response.ok) return;
    } catch {
      // Le serveur n'est pas encore prêt.
    }

    await new Promise(resolve => setTimeout(resolve, 200));
  }

  server.kill();
  throw new Error("NetAlert n'a pas démarré dans le délai prévu.");
});

after(() => {
  if (server && server.exitCode === null && !server.killed) {
    server.kill();
  }
});

test("GET /health retourne un statut OK", async () => {
  const response = await fetch(`${BASE_URL}/health`);
  const data = await response.json();

  assert.equal(response.status, 200);
  assert.equal(data.status, "ok");
  assert.equal(data.app, "NetAlert");
});

test("GET / retourne le tableau de bord HTML", async () => {
  const response = await fetch(`${BASE_URL}/`);
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /text\/html/);
  assert.match(html, /NetAlert/);
  assert.match(html, /api\/status/);
});

test("GET /api/status retourne les informations de supervision", async () => {
  const response = await fetch(`${BASE_URL}/api/status`);
  const data = await response.json();

  assert.equal(response.status, 200);
  assert.equal(data.app, "NetAlert");
  assert.equal(data.summary.total, 3);
  assert.equal(data.services.length, 3);
  assert.equal(
    data.summary.up + data.summary.down,
    data.summary.total
  );
});

test("une route inconnue retourne 404", async () => {
  const response = await fetch(`${BASE_URL}/route-inconnue`);
  const data = await response.json();

  assert.equal(response.status, 404);
  assert.equal(data.error, "Not found");
});
