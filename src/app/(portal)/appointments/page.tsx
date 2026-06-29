import { addMonths, format, isToday, isTomorrow } from "date-fns"
import { redirect } from "next/navigation"
import Link from "next/link"
import { requirePatientSession, getPatientFromSession } from "@/lib/auth-guard"
import { expandAppointments, type AppointmentOccurrence } from "@/lib/schedule-utils"
import { Calendar, Clock, ChevronLeft, RefreshCw } from "lucide-react"

export const dynamic = "force-dynamic"

const REPEAT_LABEL: Record<string, { label: string; color: string }> = {
  NONE:     { label: "One-time",  color: "bg-gray-100 text-gray-600" },
  WEEKLY:   { label: "Weekly",    color: "bg-blue-50 text-blue-700" },
  BIWEEKLY: { label: "Biweekly", color: "bg-violet-50 text-violet-700" },
  MONTHLY:  { label: "Monthly",   color: "bg-green-50 text-green-700" },
}

function dateLabel(date: Date) {
  if (isToday(date)) return "Today"
  if (isTomorrow(date)) return "Tomorrow"
  return format(date, "EEEE, MMMM d")
}

export default async function AppointmentsPage() {
  await requirePatientSession()
  const patient = await getPatientFromSession()
  if (!patient) redirect("/")

  const now = new Date()
  const threeMonths = addMonths(now, 3)
  const expanded = expandAppointments(patient.appointments, now, threeMonths)

  const grouped = expanded.reduce<Record<string, AppointmentOccurrence[]>>((acc, occ) => {
    const key = format(occ.occurrenceDate, "MMMM yyyy")
    if (!acc[key]) acc[key] = []
    acc[key].push(occ)
    return acc
  }, {})

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-5 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Upcoming Appointments</h1>
            <p className="text-sm text-gray-400">Next 3 months · {expanded.length} occurrence{expanded.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
      </div>

      {expanded.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-6 h-6 text-gray-300" />
          </div>
          <p className="text-gray-600 font-medium">No upcoming appointments</p>
          <p className="text-gray-400 text-sm mt-1">Nothing scheduled in the next 3 months.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([month, occs]) => (
            <div key={month}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{month}</span>
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-300">{occs.length}</span>
              </div>

              <div className="space-y-3">
                {occs.map(({ appointment, occurrenceDate }) => {
                  const repeat = REPEAT_LABEL[appointment.repeatSchedule]
                  const isRecurring = appointment.repeatSchedule !== "NONE"
                  return (
                    <div
                      key={`${appointment.id}-${occurrenceDate.getTime()}`}
                      className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-stretch">
                        {/* Date column */}
                        <div className="w-16 bg-blue-600 flex flex-col items-center justify-center py-4 flex-shrink-0">
                          <span className="text-blue-200 text-xs font-medium uppercase">
                            {format(occurrenceDate, "MMM")}
                          </span>
                          <span className="text-white text-2xl font-bold leading-none mt-0.5">
                            {format(occurrenceDate, "d")}
                          </span>
                          <span className="text-blue-200 text-xs mt-0.5">
                            {format(occurrenceDate, "EEE")}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 px-5 py-4 flex items-center justify-between gap-4">
                          <div>
                            <p className="font-semibold text-gray-900">{appointment.providerName}</p>
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <Clock className="w-3.5 h-3.5 text-gray-400" />
                              <span className="text-sm text-gray-500">{dateLabel(occurrenceDate)} at {format(occurrenceDate, "h:mm a")}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${repeat.color}`}>
                              {repeat.label}
                            </span>
                            {isRecurring && (
                              <div className="flex items-center gap-1 text-xs text-gray-400">
                                <RefreshCw className="w-3 h-3" />
                                <span>Recurring</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
