/**
 * scripts/generate-brochures.mjs
 *
 * Generates PDF brochures for all courses (or specific ones) by:
 * 1. Starting the Next.js dev server on a free port
 * 2. Visiting /api/brochure-html/{courseId} with Puppeteer
 * 3. Saving the PDF to public/brochures/{courseId}.pdf
 *
 * Usage:
 *   node scripts/generate-brochures.mjs              # all missing PDFs
 *   node scripts/generate-brochures.mjs --all        # regenerate all (including existing)
 *   node scripts/generate-brochures.mjs python-masterclass ai-cohort
 */

import puppeteer from "puppeteer";
import { spawn } from "child_process";
import { existsSync, mkdirSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createServer } from "net";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const BROCHURES_DIR = join(ROOT, "public", "brochures");

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getCoursesJson() {
  const raw = readFileSync(join(ROOT, "src", "data", "courses.json"), "utf-8");
  return JSON.parse(raw).variants.map((v) => v.id);
}

async function findFreePort(start = 3099) {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.listen(start, () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
    server.on("error", () => findFreePort(start + 1).then(resolve).catch(reject));
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForServer(url, timeout = 60_000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status < 500) return;
    } catch {}
    await sleep(500);
  }
  throw new Error(`Server at ${url} did not become ready within ${timeout}ms`);
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const forceAll = args.includes("--all");
  const specificIds = args.filter((a) => !a.startsWith("--"));

  mkdirSync(BROCHURES_DIR, { recursive: true });

  const allIds = getCoursesJson();
  let targetIds;

  if (specificIds.length > 0) {
    targetIds = specificIds.filter((id) => {
      if (!allIds.includes(id)) {
        console.warn(`⚠  Unknown course ID: ${id} — skipping`);
        return false;
      }
      return true;
    });
  } else if (forceAll) {
    targetIds = allIds;
  } else {
    // Only generate missing PDFs
    targetIds = allIds.filter((id) => !existsSync(join(BROCHURES_DIR, `${id}.pdf`)));
  }

  if (targetIds.length === 0) {
    console.log("✅ All PDFs are already generated. Use --all to regenerate.");
    process.exit(0);
  }

  console.log(`\n📄 Generating ${targetIds.length} brochure PDF(s):\n  ${targetIds.join(", ")}\n`);

  // Start dev server
  const port = await findFreePort(3099);
  console.log(`🚀 Starting Next.js dev server on port ${port}…`);

  const server = spawn("node_modules/.bin/next", ["dev", "--port", String(port)], {
    cwd: ROOT,
    env: { ...process.env, PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"],
  });

  const serverLogs = [];
  server.stdout.on("data", (d) => serverLogs.push(d.toString()));
  server.stderr.on("data", (d) => serverLogs.push(d.toString()));
  server.on("error", (err) => { console.error("Server error:", err); process.exit(1); });

  const BASE = `http://localhost:${port}`;

  try {
    await waitForServer(`${BASE}/api/courses`);
    console.log("✅ Server ready\n");

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 900, height: 1200 });

    let success = 0;
    let failed = 0;

    for (const courseId of targetIds) {
      const url = `${BASE}/api/brochure-html/${courseId}`;
      const outPath = join(BROCHURES_DIR, `${courseId}.pdf`);

      process.stdout.write(`  Generating ${courseId}…`);
      try {
        await page.goto(url, { waitUntil: "networkidle0", timeout: 30_000 });

        await page.pdf({
          path: outPath,
          format: "A4",
          printBackground: true,
          margin: { top: "0", right: "0", bottom: "0", left: "0" },
        });

        process.stdout.write(` ✓\n`);
        success++;
      } catch (err) {
        process.stdout.write(` ✗ (${err.message})\n`);
        failed++;
      }
    }

    await browser.close();

    console.log(`\n📦 Done: ${success} generated, ${failed} failed`);
    console.log(`📁 Output: ${BROCHURES_DIR}\n`);
  } finally {
    server.kill("SIGTERM");
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
