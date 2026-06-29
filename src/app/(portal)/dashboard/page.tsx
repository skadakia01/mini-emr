import { addDays, format } from "date-fns"
import { redirect } from "next/navigation"
import Link from "next/link"
import { requirePatientSession, getPatientFromSession } from "@/lib/auth-guard"
import { expandAppointments, expandRefills } from "@/lib/schedule-utils"
import { Calendar, Pill, ArrowRight, Clock, User, Mail, Phone, Cake, AlertCircle } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  await requirePatientSession()
  const patient = await getPatientFromSession()
  if (!patient) redirect("/")

  const now = new Date()
  const weekEnd = addDays(now, 7)
  const hour = now.getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"

  const upcomingAppts = expandAppointments(patient.appointments, now, weekEnd)
  const upcomingRxs = expandRefills(patient.prescriptions, now, weekEnd)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">

      {/* Hero banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl px-6 py-7 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(255,255,255,0.1)_0%,_transparent_60%)]" />
        <div className="relative">
          <p className="text-blue-200 text-sm font-medium mb-1">
            {format(now, "EEEE, MMMM d, yyyy")}
          </p>
          <h1 className="text-2xl font-bold">{greeting}, {patient.firstName}!</h1>
          <p className="text-blue-100 text-sm mt-1">Here's your health overview for the week.</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">This Week</span>
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{upcomingAppts.length}</p>
          <p className="text-sm text-gray-500 mt-0.5">appointment{upcomingAppts.length !== 1 ? "s" : ""}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Refills Due</span>
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
              <Pill className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{upcomingRxs.length}</p>
          <p className="text-sm text-gray-500 mt-0.5">this week</p>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Total Rx</span>
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{patient.prescriptions.length}</p>
          <p className="text-sm text-gray-500 mt-0.5">active prescription{patient.prescriptions.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Upcoming this week */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Upcoming This Week</h2>
          <Link href="/appointments" className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {upcomingAppts.length === 0 && upcomingRxs.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-xl p-8 text-center shadow-sm">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm font-medium">All clear this week</p>
            <p className="text-gray-400 text-xs mt-1">No appointments or refills due in the next 7 days.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingAppts.map(({ appointment, occurrenceDate }) => (
              <div
                key={`appt-${appointment.id}-${occurrenceDate.getTime()}`}
                className="bg-white border border-gray-100 rounded-xl px-5 py-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{appointment.providerName}</p>
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(occurrenceDate, "EEEE, MMM d")} at {format(occurrenceDate, "h:mm a")}
                  </p>
                </div>
                <span className="text-xs bg-blue-50 text-blue-700 font-medium px-2.5 py-1 rounded-full flex-shrink-0">
                  Appointment
                </span>
              </div>
            ))}

            {upcomingRxs.map(({ prescription, refillDate }) => (
              <div
                key={`rx-${prescription.id}-${refillDate.getTime()}`}
                className="bg-white border border-amber-100 rounded-xl px-5 py-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Pill className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">
                    {prescription.medicationName} <span className="text-gray-400 font-normal">{prescription.dosage}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Refill due {format(refillDate, "EEEE, MMM d")}
                  </p>
                </div>
                <span className="text-xs bg-amber-50 text-amber-700 font-medium px-2.5 py-1 rounded-full flex-shrink-0">
                  Refill Due
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Bottom grid: patient info + quick links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Patient info */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {patient.firstName[0]}{patient.lastName[0]}
              </span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">{patient.firstName} {patient.lastName}</p>
              <p className="text-xs text-gray-400">Patient</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-gray-300 flex-shrink-0" />
              <span className="text-gray-600 truncate">{patient.email}</span>
            </div>
            {patient.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-gray-300 flex-shrink-0" />
                <span className="text-gray-600">{patient.phone}</span>
              </div>
            )}
            {patient.dateOfBirth && (
              <div className="flex items-center gap-3 text-sm">
                <Cake className="w-4 h-4 text-gray-300 flex-shrink-0" />
                <span className="text-gray-600">{format(new Date(patient.dateOfBirth), "MMM d, yyyy")}</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick links */}
        <div className="space-y-3">
          <Link href="/appointments">
            <div className="bg-white border border-gray-100 rounded-xl px-5 py-4 flex items-center gap-4 shadow-sm hover:border-blue-200 hover:shadow-md transition-all group cursor-pointer">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">All Appointments</p>
                <p className="text-xs text-gray-400 mt-0.5">3-month schedule</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
            </div>
          </Link>

          <Link href="/prescriptions">
            <div className="bg-white border border-gray-100 rounded-xl px-5 py-4 flex items-center gap-4 shadow-sm hover:border-amber-200 hover:shadow-md transition-all group cursor-pointer">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                <Pill className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">Prescriptions</p>
                <p className="text-xs text-gray-400 mt-0.5">Upcoming refills</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-amber-500 transition-colors" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
