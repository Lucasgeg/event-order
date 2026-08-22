import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const LOGIN_PATHS = new Set(["/login", "/inscription"]);

export default clerkMiddleware(
  async (auth, req) => {
    const { userId, orgRole } = await auth();

    // Redirect authenticated users from the login page
    if (userId && LOGIN_PATHS.has(req.nextUrl.pathname)) {
      if (orgRole === "org:admin") {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
      return NextResponse.redirect(new URL("/user", req.url));
    }
  },
  { signInUrl: "/login", signUpUrl: "/login" }
);

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
