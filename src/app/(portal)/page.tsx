import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import LoginForm from "@/components/portal/LoginForm"

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  if (session) redirect("/dashboard")
  return <LoginForm />
}
