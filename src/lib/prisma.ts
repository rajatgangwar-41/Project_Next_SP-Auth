import { PrismaClient } from "../generated/prisma";

// 1. Create a new PrismaClient instance
const client = new PrismaClient({
  // Configure logging based on the environment
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
});

// 2. Define a global property to hold the PrismaClient instance
// 'globalThis' is used for environments like Node.js
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 3. Export the singleton instance
// Use the existing global instance if it exists, otherwise use the newly created 'client'
export const prisma = globalForPrisma.prisma ?? client;

// 4. In development, store the instance globally to reuse it
// This prevents creating a new instance on every hot reload
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
