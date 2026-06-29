import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import PortalNav from "@/components/portal/PortalNav"
import { Toaster } from "@/components/ui/sonner"

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  return (
    <div className="min-h-screen bg-gray-50">
      {session?.user && (
        <PortalNav firstName={session.user.firstName} lastName={session.user.lastName ?? ""} />
      )}
      {children}
      <Toaster />
    </div>
  )
}
