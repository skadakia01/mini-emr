"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import NewPatientForm from "./NewPatientForm"
import { Stethoscope, Plus, LogOut } from "lucide-react"

export default function AdminNav() {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" })
    router.push("/admin/login")
    router.refresh()
  }

  return (
    <>
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-gray-900 text-sm">Mini EMR</span>
              <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 font-semibold px-1.5 py-0.5 rounded">Admin</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Patient
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 text-gray-500 hover:text-red-600 hover:bg-red-50 text-sm font-medium px-3 py-2 rounded-lg transition-colors border border-gray-200"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <Dialog open={open} onOpenChange={(o) => setOpen(o)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Patient</DialogTitle>
          </DialogHeader>
          <NewPatientForm onSuccess={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}
