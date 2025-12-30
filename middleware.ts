import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import CryptoJS from "crypto-js";

const SECRET_KEY = process.env.NEXTAUTH_SECRET || "TEST"; // Use environment variable for production
const PUBLIC_ROUTES = [
  "/api/",
  "/_next/",
  "/favicon.ico",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password"
];

// Check if the current route is public
const isPublicRoute = (pathname: string) => {
  return PUBLIC_ROUTES.some(route => pathname.startsWith(route));
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip middleware for public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  const encryptedCookie = req.cookies.get("userDetails")?.value;

  // Allow access to the projects page without authentication
  if (pathname.startsWith("/projects/")) {
    return NextResponse.next();
  }

  // Redirect to login if no user is authenticated for protected routes
  if (!encryptedCookie) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Decrypt userDetails cookie
    const bytes = CryptoJS.AES.decrypt(encryptedCookie, SECRET_KEY);
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

    // Extract the access token and decode it
    const accessToken = decryptedData?.accessToken;
    if (!accessToken) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const decodedToken = JSON.parse(atob(accessToken.split(".")[1]));
    const userRole = decodedToken?.role;

    // Define allowed roles for each protected route
    const protectedRoutes: Record<string, string[]> = {
      "/dashboard/Administrator": ["ADMIN", "MODERATOR"],
      "/dashboard/freelancer": ["FREELANCER"],
      "/dashboard/client": ["CLIENT"],
    };

    // Check if the user is allowed to access the requested page
    for (const route in protectedRoutes) {
      if (pathname.startsWith(route)) {
        if (!protectedRoutes[route].includes(userRole)) {
          return NextResponse.redirect(new URL("/unauthorized", req.url));
        }
      }
    }

    // Redirect based on role if accessing `/`
    if (pathname === "/") {
      const roleRedirects: Record<string, string> = {
        ADMIN: "/dashboard/Administrator",
        MODERATOR: "/dashboard/Administrator",
        FREELANCER: "/dashboard/freelancer",
        CLIENT: "/dashboard/client",
      };
      return NextResponse.redirect(new URL(roleRedirects[userRole] || "/unauthorized", req.url));
    }
  } catch (error) {
    console.error("Error decrypting userDetails in middleware:", error);
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*"], // Protect dashboard routes
};
