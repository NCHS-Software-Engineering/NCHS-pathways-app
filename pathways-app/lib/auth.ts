import { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const STAFF_DOMAIN = "naperville203.org";
const STUDENT_SUBDOMAIN = "stu.naperville203.org";

function isDevBypassEnabled() {
  return process.env.NODE_ENV !== "production";
}

export function isAllowedDistrictEmail(email?: string | null) {
  if (isDevBypassEnabled()) return true;
  if (!email) return false;

  const normalized = email.trim().toLowerCase();

  return (
    normalized.endsWith(`@${STAFF_DOMAIN}`) &&
    !normalized.endsWith(`@${STUDENT_SUBDOMAIN}`)
  );
}

export const authOptions: NextAuthOptions = {
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
  callbacks: {
    async signIn({ user }) {
      return isAllowedDistrictEmail(user.email);
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};