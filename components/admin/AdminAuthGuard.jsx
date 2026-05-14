"use client";
import { useAuth } from "@clerk/nextjs";
import { SignIn } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function AdminAuthGuard({ children }) {
  const { userId, isLoaded } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-slate-800 mb-8 text-center">
            Admin Dashboard
          </h1>
          <SignIn
            fallbackRedirectUrl="/admin"
            routing="hash"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "w-full bg-white rounded-lg shadow-lg",
              },
            }}
          />
        </div>
      </div>
    );
  }

  return children;
}
