import NextAuth, { NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/db/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import { compareSync } from "bcrypt-ts-edge";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const config: NextAuthConfig = {
  pages: {
    signIn: "/sign-in",
    error: "/sign-in", // on error, redirect to sign in page
  },
  session: {
    // Choose how you want to save the user session.
    // The default is `"jwt"`, an encrypted JWT (JWE) stored in the session cookie.
    // If you use an `adapter` however, we default it to `"database"` instead.
    // You can still force a JWT session by explicitly defining `"jwt"`.
    // When using `"database"`, the session cookie will only contain a `sessionToken` value,
    // which is used to look up the session in the database.
    strategy: "jwt",

    // Seconds - How long until an idle session expires and is no longer valid.
    maxAge: 15 * 24 * 60 * 60, // 15 days
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        // credentials provided by the form
        if (credentials == null) return null;

        // Find user in db
        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email as string,
          },
        });

        // Check if user exists and password matches
        if (user && user.password) {
          const isMatch = compareSync(
            credentials.password as string,
            user.password
          );
          if (isMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            };
          }
        }

        // if no user found or isMatch == false, return null
        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, trigger, token, user }: any) {
      // Set the User ID from the token (JWT token)
      // console.log("token: ", token);
      session.user.id = token.sub;
      // Send properties to the client (those we set in jwt)
      session.user.role = token.role;
      session.user.name = token.name;

      // when user updates his user name, set the user name to the session too
      if (trigger === "update") {
        session.user.name = user.name;
      }
      // console.log('session: ', session);
      return session;
    },
    async jwt({ token, user, trigger, session }: any) {
      // Assign user fields (role and name) to token
      if (user) {
        token.id = user.id;
        token.role = user.role;
        // If user has no name, use the email
        if (user.name === "NO_NAME") {
          token.name = user.email!.split("@")[0];
        }

        // Persist cart session when signing in/up
        if (trigger === "signIn" || trigger === "signUp") {
          const cookiesObj = await cookies();
          const sessionCartId = cookiesObj.get("sessionCartId")?.value;

          // set session cart cookie to sessionCartId field in cart model
          if (sessionCartId) {
            const sessionCart = await prisma.cart.findFirst({
              where: { sessionCartId },
            });

            if (sessionCart) {
              // delete current user cart
              await prisma.cart.deleteMany({
                where: { userId: user.id },
              });

              // assign new cart
              await prisma.cart.update({
                where: { id: sessionCart.id },
                data: { userId: user.id },
              });
            }
          }
        }

        // Update database to reflect token name
        await prisma.user.update({
          where: { id: user.id },
          data: { name: token.name },
        });
      }

      return token;
    },
    async authorized({ request, auth }: any) {
      // Protecting paths
      // Array of regex patterns of paths we want to protect
      const protectedPaths = [
        /\/shipping-address/,
        /\/payment-method/,
        /\/place-order/,
        /\/profile/,
        /\/user\/(.*)/, // user/show, user/123 etc
        /\/order\/(.*)/,
        /\/admin/,
      ];

      // Get pathname from the req URL object
      const { pathname } = request.nextUrl;

      // Check if user is not authenticated and accessing a protected path
      // on false it redirects to the sign-in page (I have set on pages.error above)
      if (!auth && protectedPaths.some((path) => path.test(pathname)))
        return false;

      // Check for session cart cookie
      if (!request.cookies.get("sessionCartId")) {
        // Generate new sessionCartId cookie
        const sessionCartId = crypto.randomUUID();

        // Clone request headers
        const newRequestHeaders = new Headers(request.headers);

        // Create new response and add the new headers
        const response = NextResponse.next({
          request: {
            headers: newRequestHeaders,
          },
        });

        // Set the custom created sessionCartId in the response cookies
        response.cookies.set("sessionCartId", sessionCartId);
        return response;
      } else {
        return true;
      }
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
