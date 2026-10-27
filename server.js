const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const PORT = Number(process.env.PORT || 3000);
const DASHBOARD = path.join(__dirname, "public", "index.html");

const targets = [
  { name: "NetAlert API", url: `http://127.0.0.1:${PORT}/health` },
  { name: "Example Website", url: "https://example.com" },
  { name: "Node.js Website", url: "https://nodejs.org" }
];

function classifyResponse(statusCode) {
  return statusCode >= 200 && statusCode < 400 ? "UP" : "DOWN";
}

async function checkTarget(target) {
  const startedAt = Date.now();

  try {
    const response = await fetch(target.url, {
      signal: AbortSignal.timeout(3500),
      redirect: "follow"
    });

    return {
      name: target.name,
      url: target.url,
      status: classifyResponse(response.status),
      statusCode: response.status,
      latencyMs: Date.now() - startedAt
    };
  } catch (error) {
    return {
      name: target.name,
      url: target.url,
      status: "DOWN",
      error: error.name === "TimeoutError" ? "Timeout" : "Connection failed",
      latencyMs: Date.now() - startedAt
    };
  }
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const pathname = new URL(req.url, `http://${req.headers.host || "localhost"}`).pathname;

  if (req.method !== "GET") {
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  if (pathname === "/health") {
    return sendJson(res, 200, {
      status: "ok",
      app: "NetAlert"
    });
  }

  if (pathname === "/api/status") {
    const services = await Promise.all(targets.map(checkTarget));
    const up = services.filter(service => service.status === "UP").length;
    const down = services.length - up;

    return sendJson(res, 200, {
      app: "NetAlert",
      checkedAt: new Date().toISOString(),
      summary: {
        total: services.length,
        up,
        down
      },
      services
    });
  }

  if (pathname === "/" || pathname === "/index.html") {
    fs.readFile(DASHBOARD, (error, content) => {
      if (error) {
        return sendJson(res, 500, { error: "Dashboard file unavailable" });
      }

      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store"
      });
      res.end(content);
    });
    return;
  }

  return sendJson(res, 404, { error: "Not found" });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`NetAlert is running on http://localhost:${PORT}`);
});

function shutdown() {
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
