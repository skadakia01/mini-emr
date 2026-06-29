import { prisma } from "@/lib/prisma"
import PatientTable from "@/components/admin/PatientTable"
import { Users, Calendar, Pill } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const patients = await prisma.patient.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      dateOfBirth: true,
      phone: true,
      createdAt: true,
      _count: {
        select: { appointments: true, prescriptions: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const totalAppts = patients.reduce((sum, p) => sum + p._count.appointments, 0)
  const totalRxs = patients.reduce((sum, p) => sum + p._count.prescriptions, 0)

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Patient Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Manage patients, appointments, and prescriptions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Patients</span>
            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-indigo-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{patients.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">total registered</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Appointments</span>
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalAppts}</p>
          <p className="text-xs text-gray-400 mt-0.5">across all patients</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Prescriptions</span>
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
              <Pill className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalRxs}</p>
          <p className="text-xs text-gray-400 mt-0.5">active prescriptions</p>
        </div>
      </div>

      {/* Patient table */}
      <PatientTable patients={JSON.parse(JSON.stringify(patients))} />
    </div>
  )
}
