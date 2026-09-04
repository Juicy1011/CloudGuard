"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoginPage from "@/components/LoginPage";
import { getStoredUser, setStoredUser } from "@/lib/auth";

export default function LoginRoute() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      router.replace("/dashboard");
    } else {
      setChecking(false);
    }
  }, [router]);

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <LoginPage
      onLoginSuccess={(loggedInUser, rememberMe) => {
        setStoredUser(loggedInUser, rememberMe);
        router.push("/dashboard");
      }}
    />
  );
}
