import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";

import {
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation,
} from "@/inngest/functions";

console.log("[Inngest Route] Initializing...");
console.log("- NODE_ENV:", process.env.NODE_ENV);
console.log("- DATABASE_URL:", process.env.DATABASE_URL ? "✓ set" : "✗ missing");
console.log("- INNGEST_SIGNING_KEY:", process.env.INNGEST_SIGNING_KEY ? "✓ set" : "✗ missing");
console.log("- INNGEST_EVENT_KEY:", process.env.INNGEST_EVENT_KEY ? "✓ set" : "✗ missing");

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [syncUserCreation, syncUserUpdation, syncUserDeletion],
});
