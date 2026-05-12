import { PrismaClient } from "@/src/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";

import ws from "ws";
neonConfig.webSocketConstructor = ws;

neonConfig.poolQueryViaFetch = true;

let prismaClient;
let initError = null;

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL?.trim();

  if (!connectionString) {
    const error = new Error("DATABASE_URL is required to initialize PrismaClient.");
    initError = error;
    console.error("[Prisma] Initialization error:", error.message);
    throw error;
  }

  try {
    const adapter = new PrismaNeon({ connectionString });
    return new PrismaClient({ adapter });
  } catch (error) {
    initError = error;
    console.error("[Prisma] Failed to create client:", error);
    throw error;
  }
}

function getPrismaClient() {
  if (process.env.NODE_ENV === "development") {
    if (!global.prisma) {
      try {
        global.prisma = createPrismaClient();
      } catch (error) {
        console.error("[Prisma Dev] Failed to initialize:", error);
        throw error;
      }
    }

    return global.prisma;
  }

  if (!prismaClient) {
    try {
      prismaClient = createPrismaClient();
    } catch (error) {
      console.error("[Prisma Prod] Failed to initialize:", error);
      throw error;
    }
  }

  return prismaClient;
}

const prisma = new Proxy(
  {},
  {
    get(_target, property) {
      try {
        const client = getPrismaClient();
        const value = client[property];

        return typeof value === "function" ? value.bind(client) : value;
      } catch (error) {
        console.error("[Prisma Proxy] Error accessing property:", property, error);
        throw error;
      }
    },
  },
);

export default prisma;
