// prisma/seed.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);
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
      update: {},
      create: {
        name: email.split("@")[0],
        email,
        password: passwordHash,
      },
    });
  }
  console.log("Demo users created/updated.");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
