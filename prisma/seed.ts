import "dotenv/config";
import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function upsertUser(input: {
  email: string;
  password: string;
  name: string;
  role: "ADMIN" | "DRIVER";
}) {
  if (input.password.length < 12) {
    throw new Error(`Password for ${input.email} must be at least 12 characters.`);
  }

  const email = input.email.trim().toLowerCase();
  const passwordHash = await hash(input.password, 12);
  const now = new Date();

  const existing = await prisma.user.findUnique({ where: { email } });
  const user = existing
    ? await prisma.user.update({
        where: { email },
        data: {
          name: input.name,
          passwordHash,
          role: input.role,
          active: true,
          passwordChangedAt: now,
        },
      })
    : await prisma.user.create({
        data: {
          email,
          name: input.name,
          passwordHash,
          role: input.role,
          active: true,
          passwordChangedAt: now,
        },
      });

  console.log(`Seeded ${user.role.toLowerCase()} user: ${user.email}`);
  return user;
}

async function main() {
  await upsertUser({
    email: process.env.ADMIN_SEED_EMAIL ?? "admin@urbanmovelogistics.co.uk",
    password: process.env.ADMIN_SEED_PASSWORD ?? "ChangeMeNow!2026",
    name: "Admin",
    role: "ADMIN",
  });

  await upsertUser({
    email: process.env.DRIVER_SEED_EMAIL ?? "driver@urbanmovelogistics.co.uk",
    password: process.env.DRIVER_SEED_PASSWORD ?? "ChangeMeNow!2026",
    name: "Test Driver",
    role: "DRIVER",
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
