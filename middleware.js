import { clerkMiddleware } from "@clerk/nextjs/server";
 
export default clerkMiddleware({
  // Routes that can be accessed while signed out
  publicRoutes: ["/", "/product/:id", "/all-products", "/api/webhook"],
  // Routes that can always be accessed, and have
  // no authentication information
  ignoredRoutes: ["/api/webhook"],
});
 
export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};