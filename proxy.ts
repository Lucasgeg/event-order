import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isLoginPage = createRouteMatcher(["/login"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(
  async (auth, req) => {
    const { userId, orgRole } = await auth();

    // Redirect authenticated users from the login page
    if (userId && isLoginPage(req)) {
      if (orgRole === "org:admin") {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
      return NextResponse.redirect(new URL("/user", req.url));
    }

    // Protect admin routes
    if (isAdminRoute(req)) {
      await auth.protect();

      if (orgRole !== "org:admin") {
        return NextResponse.redirect(new URL("/", req.url));
      }
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
