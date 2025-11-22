import { NextRequest, NextResponse } from "next/server";

import { minimatch } from "minimatch";

const publicPaths = ["/", "/login", "/register", "/verify/*"];

export async function proxy(req: NextRequest) {
  const url = new URL(req.url);

  const pathname = url.pathname;
  const isPublic = publicPaths.some((pattern) =>
    minimatch(pathname, pattern, { nocase: true })
  );

  if (isPublic) {
    return NextResponse.next();
  }

  const accessToken = req.cookies.get("accessToken");

  if (!accessToken) return NextResponse.redirect(new URL("/login", req.url));

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
