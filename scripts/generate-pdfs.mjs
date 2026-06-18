/**
 * Converts all 14 course brochure HTML files to PDFs using headless Chrome.
 * Output: course-brochures/pdfs/<id>.pdf
 *
 * Run: node scripts/generate-pdfs.mjs
 * Requires: npm install --save-dev puppeteer (already done)
 */

import puppeteer from "puppeteer";
import { createServer } from "http";
import { readFileSync, createReadStream, existsSync } from "fs";
import { join, extname } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = join(__dirname, "..");
const BROCHURES_DIR = join(ROOT, "course-brochures");
const OUT_DIR = join(BROCHURES_DIR, "pdfs");

const COURSES = [
  "python-masterclass",
  "python-cohort",
  "python-deep-dive",
  "python-standard",
  "ai-masterclass",
  "ai-cohort",
  "ai-deep-dive",
  "calculus-masterclass",
  "linear-algebra-masterclass",
  "maths-cohort",
  "webdev-sprint",
  "react-sprint",
  "physics-cohort",
  "dsa-standard",
];

const MIME = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".woff2": "font/woff2",
  ".png": "image/png",
  ".jpg": "image/jpeg",
};

function startServer(dir, port) {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      const filePath = join(dir, req.url === "/" ? "/index.html" : req.url);
      if (!existsSync(filePath)) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      const ext = extname(filePath);
      res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
      createReadStream(filePath).pipe(res);
    });
    server.listen(port, () => {
      console.log(`  Server listening at http://localhost:${port}`);
      resolve(server);
    });
  });
}

async function main() {
  const PORT = 4446;
  const server = await startServer(BROCHURES_DIR, PORT);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    for (const id of COURSES) {
      const url = `http://localhost:${PORT}/${id}.html`;
      const outPath = join(OUT_DIR, `${id}.pdf`);

      process.stdout.write(`  Generating ${id}.pdf … `);
      const page = await browser.newPage();

      // Wait for Google Fonts to load
      await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });

      // Extra wait for font rendering
      await new Promise((r) => setTimeout(r, 800));

      await page.pdf({
        path: outPath,
        format: "A4",
        printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
      });

      await page.close();
      console.log("done");
    }
  } finally {
    await browser.close();
    server.close();
  }

  console.log(`\n✓ All ${COURSES.length} PDFs written to course-brochures/pdfs/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
