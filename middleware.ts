import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// If Clerk environment variables are not provided (for example in preview or
// environments where Clerk isn't configured), skip running the middleware to
// avoid runtime errors during middleware invocation.
const isClerkConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_FRONTEND_API && process.env.CLERK_SECRET
);

const handler = isClerkConfigured ? clerkMiddleware() : () => NextResponse.next();

export default handler;

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|api/inngest|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
};