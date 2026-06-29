"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import EditPatientForm from "./EditPatientForm"
import AppointmentForm from "./AppointmentForm"
import PrescriptionForm from "./PrescriptionForm"
import DeleteConfirmDialog from "./DeleteConfirmDialog"
import {
  Mail, Phone, MapPin, Calendar, Pill, Edit2, Plus, Trash2,
  Clock, RefreshCw, Package, CalendarDays,
} from "lucide-react"

type Appointment = {
  id: number
  patientId: number
  providerName: string
  dateTime: string
  repeatSchedule: "NONE" | "WEEKLY" | "BIWEEKLY" | "MONTHLY"
  endDate: string | null
}

type Prescription = {
  id: number
  patientId: number
  medicationName: string
  dosage: string
  quantity: number
  refillDate: string
  refillSchedule: "NONE" | "MONTHLY" | "QUARTERLY"
}

type Patient = {
  id: number
  firstName: string
  lastName: string
  email: string
  dateOfBirth: string | null
  phone: string | null
  address: string | null
  appointments: Appointment[]
  prescriptions: Prescription[]
}

const REPEAT_LABEL: Record<string, string> = {
  NONE: "One-time", WEEKLY: "Weekly", BIWEEKLY: "Biweekly", MONTHLY: "Monthly",
}
const REPEAT_COLOR: Record<string, string> = {
  NONE: "bg-gray-100 text-gray-600",
  WEEKLY: "bg-blue-50 text-blue-700",
  BIWEEKLY: "bg-violet-50 text-violet-700",
  MONTHLY: "bg-green-50 text-green-700",
}
const REFILL_LABEL: Record<string, string> = {
  NONE: "One-time", MONTHLY: "Monthly", QUARTERLY: "Quarterly",
}
const REFILL_COLOR: Record<string, string> = {
  NONE: "bg-gray-100 text-gray-600",
  MONTHLY: "bg-green-50 text-green-700",
  QUARTERLY: "bg-amber-50 text-amber-700",
}

function fmt(val: string | null) {
  if (!val) return "—"
  return new Intl.DateTimeFormat("en-US", {
    month: "short", day: "numeric", year: "numeric",
  }).format(new Date(val))
}

function fmtDateTime(val: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  }).format(new Date(val))
}

export default function PatientDetailClient({ patient }: { patient: Patient }) {
  const router = useRouter()
  const [tab, setTab] = useState<"appointments" | "prescriptions">("appointments")

  const [editPatientOpen, setEditPatientOpen] = useState(false)
  const [apptFormOpen, setApptFormOpen] = useState(false)
  const [editingAppt, setEditingAppt] = useState<Appointment | null>(null)
  const [deletingApptId, setDeletingApptId] = useState<number | null>(null)
  const [rxFormOpen, setRxFormOpen] = useState(false)
  const [editingRx, setEditingRx] = useState<Prescription | null>(null)
  const [deletingRxId, setDeletingRxId] = useState<number | null>(null)

  async function deleteAppointment(id: number) {
    const res = await fetch(`/api/appointments/${id}`, { method: "DELETE" })
    if (!res.ok) throw new Error("Failed to delete appointment")
    toast.success("Appointment deleted")
    router.refresh()
  }

  async function deletePrescription(id: number) {
    const res = await fetch(`/api/prescriptions/${id}`, { method: "DELETE" })
    if (!res.ok) throw new Error("Failed to delete prescription")
    toast.success("Prescription deleted")
    router.refresh()
  }

  const initials = `${patient.firstName[0]}${patient.lastName[0]}`.toUpperCase()

  return (
    <div>
      {/* Patient header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-2xl p-6 mb-6 text-white shadow-lg">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl font-bold">
              {initials}
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {patient.firstName} {patient.lastName}
              </h1>
              <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full mt-1 inline-block">
                Patient #{patient.id}
              </span>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
                <div className="flex items-center gap-1.5 text-sm text-indigo-100">
                  <Mail className="w-3.5 h-3.5 text-indigo-300" />
                  {patient.email}
                </div>
                {patient.phone && (
                  <div className="flex items-center gap-1.5 text-sm text-indigo-100">
                    <Phone className="w-3.5 h-3.5 text-indigo-300" />
                    {patient.phone}
                  </div>
                )}
                {patient.dateOfBirth && (
                  <div className="flex items-center gap-1.5 text-sm text-indigo-100">
                    <CalendarDays className="w-3.5 h-3.5 text-indigo-300" />
                    DOB: {fmt(patient.dateOfBirth)}
                  </div>
                )}
                {patient.address && (
                  <div className="flex items-center gap-1.5 text-sm text-indigo-100">
                    <MapPin className="w-3.5 h-3.5 text-indigo-300" />
                    {patient.address}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-4 flex-shrink-0">
            <button
              onClick={() => setEditPatientOpen(true)}
              className="inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit Patient
            </button>
            <div className="flex gap-5 text-center">
              <div>
                <p className="text-2xl font-bold">{patient.appointments.length}</p>
                <p className="text-xs text-indigo-200 mt-0.5">Appointments</p>
              </div>
              <div className="w-px bg-white/20" />
              <div>
                <p className="text-2xl font-bold">{patient.prescriptions.length}</p>
                <p className="text-xs text-indigo-200 mt-0.5">Prescriptions</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pill tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
        {(["appointments", "prescriptions"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-all",
              tab === t
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700",
            )}
          >
            {t === "appointments"
              ? <Calendar className="w-4 h-4" />
              : <Pill className="w-4 h-4" />}
            {t === "appointments" ? "Appointments" : "Prescriptions"}
            <span className={cn(
              "text-xs rounded-full px-2 py-0.5 font-bold transition-colors",
              tab === t ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-500",
            )}>
              {t === "appointments" ? patient.appointments.length : patient.prescriptions.length}
            </span>
          </button>
        ))}
      </div>

      {/* Appointments tab */}
      {tab === "appointments" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">
              {patient.appointments.length} appointment{patient.appointments.length !== 1 ? "s" : ""} on file
            </p>
            <button
              onClick={() => { setEditingAppt(null); setApptFormOpen(true) }}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Appointment
            </button>
          </div>

          {patient.appointments.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
              <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-gray-600 font-medium">No appointments yet</p>
              <p className="text-gray-400 text-sm mt-1">Click "Add Appointment" to schedule one.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {patient.appointments.map((a) => (
                <div
                  key={a.id}
                  className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-stretch">
                    <div className="w-16 bg-indigo-600 flex flex-col items-center justify-center py-4 flex-shrink-0">
                      <span className="text-indigo-200 text-xs font-medium uppercase">
                        {new Intl.DateTimeFormat("en-US", { month: "short" }).format(new Date(a.dateTime))}
                      </span>
                      <span className="text-white text-2xl font-bold leading-none mt-0.5">
                        {new Date(a.dateTime).getDate()}
                      </span>
                      <span className="text-indigo-200 text-xs mt-0.5">
                        {new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(new Date(a.dateTime))}
                      </span>
                    </div>

                    <div className="flex-1 px-5 py-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-gray-900">{a.providerName}</p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-sm text-gray-500">{fmtDateTime(a.dateTime)}</span>
                        </div>
                        {a.endDate && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <RefreshCw className="w-3 h-3 text-gray-300" />
                            <span className="text-xs text-gray-400">Until {fmt(a.endDate)}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2.5 flex-shrink-0">
                        <span className={cn(
                          "text-xs font-medium px-2.5 py-1 rounded-full",
                          REPEAT_COLOR[a.repeatSchedule],
                        )}>
                          {REPEAT_LABEL[a.repeatSchedule]}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setEditingAppt(a); setApptFormOpen(true) }}
                            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg transition-colors border border-gray-200"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => setDeletingApptId(a.id)}
                            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors border border-gray-200"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Prescriptions tab */}
      {tab === "prescriptions" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">
              {patient.prescriptions.length} prescription{patient.prescriptions.length !== 1 ? "s" : ""} on file
            </p>
            <button
              onClick={() => { setEditingRx(null); setRxFormOpen(true) }}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Prescription
            </button>
          </div>

          {patient.prescriptions.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
              <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Pill className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-gray-600 font-medium">No prescriptions yet</p>
              <p className="text-gray-400 text-sm mt-1">Click "Add Prescription" to add one.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {patient.prescriptions.map((rx) => (
                <div
                  key={rx.id}
                  className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-stretch">
                    <div className="w-2 bg-amber-500 flex-shrink-0" />
                    <div className="flex-1 px-5 py-4 flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-amber-50 border border-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Pill className="w-4 h-4 text-amber-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{rx.medicationName}</p>
                            <p className="text-sm text-gray-500">{rx.dosage}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-5 mt-2.5 ml-12">
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Package className="w-3.5 h-3.5 text-gray-400" />
                            Qty: {rx.quantity}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            Next refill: {fmt(rx.refillDate)}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2.5 flex-shrink-0">
                        <span className={cn(
                          "text-xs font-medium px-2.5 py-1 rounded-full",
                          REFILL_COLOR[rx.refillSchedule],
                        )}>
                          {REFILL_LABEL[rx.refillSchedule]}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setEditingRx(rx); setRxFormOpen(true) }}
                            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg transition-colors border border-gray-200"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => setDeletingRxId(rx.id)}
                            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors border border-gray-200"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Patient Dialog */}
      <Dialog open={editPatientOpen} onOpenChange={(o) => setEditPatientOpen(o)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Edit Patient</DialogTitle></DialogHeader>
          <EditPatientForm patient={patient} onSuccess={() => setEditPatientOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Appointment Form Dialog */}
      <Dialog
        open={apptFormOpen}
        onOpenChange={(o) => { setApptFormOpen(o); if (!o) setEditingAppt(null) }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingAppt ? "Edit Appointment" : "Add Appointment"}</DialogTitle>
          </DialogHeader>
          <AppointmentForm
            patientId={patient.id}
            appointment={editingAppt ?? undefined}
            onSuccess={() => { setApptFormOpen(false); setEditingAppt(null) }}
          />
        </DialogContent>
      </Dialog>

      {/* Prescription Form Dialog */}
      <Dialog
        open={rxFormOpen}
        onOpenChange={(o) => { setRxFormOpen(o); if (!o) setEditingRx(null) }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingRx ? "Edit Prescription" : "Add Prescription"}</DialogTitle>
          </DialogHeader>
          <PrescriptionForm
            patientId={patient.id}
            prescription={editingRx ?? undefined}
            onSuccess={() => { setRxFormOpen(false); setEditingRx(null) }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Appointment */}
      <DeleteConfirmDialog
        open={deletingApptId !== null}
        onOpenChange={(o) => { if (!o) setDeletingApptId(null) }}
        title="Delete Appointment"
        description="Are you sure you want to delete this appointment? This cannot be undone."
        onConfirm={() => deleteAppointment(deletingApptId!)}
      />

      {/* Delete Prescription */}
      <DeleteConfirmDialog
        open={deletingRxId !== null}
        onOpenChange={(o) => { if (!o) setDeletingRxId(null) }}
        title="Delete Prescription"
        description="Are you sure you want to delete this prescription? This cannot be undone."
        onConfirm={() => deletePrescription(deletingRxId!)}
      />
    </div>
  )
}
