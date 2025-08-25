// prisma/seed.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  // Admin user (always ADMIN)
  await prisma.user.upsert({
    where: { email: "rishav@example.com" },
    update: { role: "ADMIN" }, // 👈 ensures role stays ADMIN even if user exists
    create: {
      name: "Rishav",
      email: "rishav@example.com",
      password: passwordHash,
      role: "ADMIN",
    },
  });

  // Demo users (always USER)
  const demoEmails = [
    "demo1@example.com",
    "demo2@example.com",
    "demo3@example.com",
    "demo4@example.com",
    "demo5@example.com",
  ];

  for (const email of demoEmails) {
    await prisma.user.upsert({
      where: { email },
      update: { role: "USER" }, // 👈 ensures they stay USER
      create: {
        name: email.split("@")[0],
        email,
        password: passwordHash,
        role: "USER",
      },
    });
  }

  console.log("Admin + Demo users created/updated ✅");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
