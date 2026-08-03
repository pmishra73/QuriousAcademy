/**
 * Sets photo and bio on the admin user so the instructor card and blog
 * author card show real details instead of a gradient avatar.
 *
 * Run once:  npx tsx scripts/update-admin-profile.ts
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local", override: true });

import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" }) });

const PROFILE = {
  photo: "/founder.png",
  bio: "GenAI Solutions Architect with 15+ years of teaching experience. Programmer, Systems Architect, and AI specialist who has taught 2,500+ students and delivered 60+ production projects.",
};

async function main() {
  const admin = await db.user.findFirst({ where: { role: "admin" }, select: { id: true, name: true } });
  if (!admin) { console.error("No admin user found."); process.exit(1); }

  await db.user.update({
    where: { id: admin.id },
    data: PROFILE,
  });

  console.log(`✓ Updated profile for ${admin.name}`);
  console.log(`  photo: ${PROFILE.photo}`);
  console.log(`  bio:   ${PROFILE.bio}`);
  await db.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
