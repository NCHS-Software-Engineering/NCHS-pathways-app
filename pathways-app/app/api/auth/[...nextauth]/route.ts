import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user }) {

      const email = user.email;
      const name = user.name;
      console.log(email, name) ;
      if (!email) {
        return false;
      }

      try {
        // Check if user exists by email
        const res = await fetch(`${BASE_URL}/api/users?email=${encodeURIComponent(email)}`);
        if (!res.ok) return false;

        const existing = await res.json();
        console.log("Existing user check:", existing);
        const userExists = existing.some(
          (u: { User_Email: string }) => u.User_Email === email
        );

        if (!userExists) {
          // User does not exist — create them
          const createRes = await fetch(`${BASE_URL}/api/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              Username: name ?? email,
              User_Email: email,
              Stored_Pathways: [],
              Pathway_Progress: [],
            }),
          });

          if (!createRes.ok) return false;
        }

        return true;
      } catch (err) {
        console.error("signIn callback error:", err);
        return false;
      }
    },
  },
});

export { handler as GET, handler as POST };