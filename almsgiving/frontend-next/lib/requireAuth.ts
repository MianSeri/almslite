"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { getStoredToken } from "@/lib/auth";

type AuthStatus = "checking" | "authed" | "guest";

export function useRequireAuth(loginPath = "/nonprofit/login") {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // null / "checking" prevents flashing + avoids hook-order pitfalls
  const [status, setStatus] = useState<AuthStatus>("checking");

  useEffect(() => {
    const token = getStoredToken();

    if (!token) {
      // build the full current path (pathname + query) like location in react-router
      const qs = searchParams?.toString();
      const current = qs ? `${pathname}?${qs}` : pathname;

      // login page receives ?next=/dashboard (or whatever they tried)
      const nextUrl = `${loginPath}?next=${encodeURIComponent(current)}`;

      setStatus("guest");
      router.replace(nextUrl);
      return;
    }

    setStatus("authed");
  }, [router, loginPath, pathname, searchParams]);

  return status === "authed";
}