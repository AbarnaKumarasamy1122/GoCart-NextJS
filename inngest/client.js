import { Inngest } from "inngest";

const signingKey = process.env.INNGEST_SIGNING_KEY?.trim();
const signingKeyFallback = process.env.INNGEST_SIGNING_KEY_FALLBACK?.trim();

export const inngest = new Inngest({
  id: "gocart-ecommerce",
  signingKey,
  signingKeyFallback,
});
