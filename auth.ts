import NextAuth, { NextAuthConfig } from "next-auth";
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from "@/db/prisma";
import CredentialsProvider from 'next-auth/providers/credentials';
import { compareSync } from "bcrypt-ts-edge";

export const config: NextAuthConfig = {
  pages: {
    signIn: '/sign-in',
    error: '/sign-in', // on error, redirect to sign in page
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
        email: { type: 'email' },
        password: { type: 'password' },
      },
      async authorize(credentials) { // credentials provided by the form
        if (credentials == null) return null;

        // Find user in db
        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email as string
          }
        });

        // Check if user exists and password matches
        if(user && user.password) {
          const isMatch = compareSync(credentials.password as string, user.password);
          if(isMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role
            };
          }
        }

        // if no user found or isMatch == false, return null
        return null;
      }
    })
  ],
  callbacks: {
    async session({ session, trigger, token, user }: any) {
      // Set the User ID from the token
      session.user.id = token.sub;

      // if there's an update, set the user name
      if (trigger === 'update') {
        session.user.name = user.name;
      }

      return session
    },
  }
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);