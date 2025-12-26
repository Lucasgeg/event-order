/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { User } from "@/app/types";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials.email as string;
        const password = credentials.password as string;

        let user: User | null = null;

        if (password === "password") {
          if (email === "toto@gmail.com") {
            user = {
              name: "Admin",
              email: "toto@gmail.com",
              role: "admin",
            };
          } else if (email === "user@gmail.com") {
            user = {
              name: "User",
              email: "user@gmail.com",
              role: "user",
            };
          }
        }

        if (!user) {
          return null;
        }

        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as User).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
});
