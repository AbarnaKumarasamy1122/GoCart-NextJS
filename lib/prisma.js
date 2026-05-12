import { PrismaClient } from "../src/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";

import ws from "ws";
neonConfig.webSocketConstructor = ws;

neonConfig.poolQueryViaFetch = true;

let prismaClient;

function createPrismaClient() {
	const connectionString = process.env.DATABASE_URL?.trim();

	if (!connectionString) {
		throw new Error("DATABASE_URL is required to initialize PrismaClient.");
	}

	const adapter = new PrismaNeon({ connectionString });

	return new PrismaClient({ adapter });
}

function getPrismaClient() {
	if (process.env.NODE_ENV === "development") {
		if (!global.prisma) {
			global.prisma = createPrismaClient();
		}

		return global.prisma;
	}

	if (!prismaClient) {
		prismaClient = createPrismaClient();
	}

	return prismaClient;
}

const prisma = new Proxy(
	{},
	{
		get(_target, property) {
			const client = getPrismaClient();
			const value = client[property];

			return typeof value === "function" ? value.bind(client) : value;
		},
	}
);

export default prisma;