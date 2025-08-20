import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: ["query", "info", "warn", "error"] });

prisma.$connect()
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch((err) => console.error("❌ DB Connection Error:", err));

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
