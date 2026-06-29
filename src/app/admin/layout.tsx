import AdminNav from "@/components/admin/AdminNav"
import { Toaster } from "@/components/ui/sonner"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
      <Toaster />
    </div>
  )
}
