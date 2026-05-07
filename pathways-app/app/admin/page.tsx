import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions, isAllowedAdminEmail } from "@/lib/auth";
import AdminPageClient from "./AdminPageClient";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!session) {
    redirect("/api/auth/signin?callbackUrl=/admin");
  }

  if (!isAllowedAdminEmail(email)) {
    redirect("/dashboard");
  }

  return <AdminPageClient />;
}
