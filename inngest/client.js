import { Inngest } from "inngest";

const signingKey = process.env.INNGEST_SIGNING_KEY?.trim();
const signingKeyFallback = process.env.INNGEST_SIGNING_KEY_FALLBACK?.trim();
const eventKey = process.env.INNGEST_EVENT_KEY?.trim();

export const inngest = new Inngest({
  id: "gocart-ecommerce",
  eventKey,
  signingKey,
  signingKeyFallback,
});
