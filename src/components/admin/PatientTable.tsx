"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import NewPatientForm from "./NewPatientForm"

type Patient = {
  id: number
  firstName: string
  lastName: string
  email: string
  dateOfBirth: string | null
  phone: string | null
  createdAt: string
  _count: { appointments: number; prescriptions: number }
}

function formatDate(val: string | null) {
  if (!val) return "—"
  return new Intl.DateTimeFormat("en-US", {
    month: "short", day: "numeric", year: "numeric",
  }).format(new Date(val))
}

export default function PatientTable({ patients }: { patients: Patient[] }) {
  const [search, setSearch] = useState("")
  const [newOpen, setNewOpen] = useState(false)

  const filtered = patients.filter((p) => {
    const q = search.toLowerCase()
    return (
      p.firstName.toLowerCase().includes(q) ||
      p.lastName.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q)
    )
  })

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Input
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={() => setNewOpen(true)}>+ New Patient</Button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          {search ? "No patients match your search." : "No patients yet."}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Date of Birth</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-center">Appts</TableHead>
                <TableHead className="text-center">Rxs</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id} className="hover:bg-gray-50 transition-colors">
                  <TableCell className="font-medium">
                    {p.firstName} {p.lastName}
                  </TableCell>
                  <TableCell className="text-gray-600">{p.email}</TableCell>
                  <TableCell className="text-gray-600">{formatDate(p.dateOfBirth)}</TableCell>
                  <TableCell className="text-gray-600">{p.phone ?? "—"}</TableCell>
                  <TableCell className="text-center">{p._count.appointments}</TableCell>
                  <TableCell className="text-center">{p._count.prescriptions}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/patients/${p.id}`}>
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={newOpen} onOpenChange={(o) => setNewOpen(o)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Patient</DialogTitle>
          </DialogHeader>
          <NewPatientForm onSuccess={() => setNewOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
