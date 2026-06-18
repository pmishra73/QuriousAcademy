/**
 * Uploads all generated PDFs to Vercel Blob (private access).
 * Prints a mapping of courseId → blob URL — save these in BROCHURE_BLOB_URLS env var.
 *
 * Prerequisites:
 *   1. Run `node scripts/generate-pdfs.mjs` first.
 *   2. Set BLOB_READ_WRITE_TOKEN in your environment:
 *      export BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
 *      (Get it from: Vercel dashboard → Storage → Blob → your store → Connect & Keys)
 *
 * Run: BLOB_READ_WRITE_TOKEN=... node scripts/upload-brochures.mjs
 */

import { put } from "@vercel/blob";
import { readFileSync, existsSync } from "fs";
import { join, fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = join(__dirname, "..");
const PDFS_DIR = join(ROOT, "course-brochures/pdfs");

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

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("Error: BLOB_READ_WRITE_TOKEN env var is not set.");
    console.error(
      "Get it from: Vercel dashboard → Storage → Blob → your store → Connect & Keys"
    );
    process.exit(1);
  }

  const urls = {};

  for (const id of COURSES) {
    const pdfPath = join(PDFS_DIR, `${id}.pdf`);
    if (!existsSync(pdfPath)) {
      console.warn(`  ⚠ Skipping ${id} — PDF not found at ${pdfPath}`);
      continue;
    }

    process.stdout.write(`  Uploading ${id}.pdf … `);
    const data = readFileSync(pdfPath);

    const blob = await put(`brochures/${id}.pdf`, data, {
      access: "public", // we gate access via signed URLs in the API, not at Blob level
      contentType: "application/pdf",
      addRandomSuffix: false,
    });

    urls[id] = blob.url;
    console.log("done →", blob.url);
  }

  console.log("\n─── Add this to your .env and Vercel env vars ───");
  console.log(
    `BROCHURE_BLOB_URLS='${JSON.stringify(urls)}'`
  );
  console.log("─────────────────────────────────────────────────");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
