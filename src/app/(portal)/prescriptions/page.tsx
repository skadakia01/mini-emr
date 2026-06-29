import { addDays, addMonths, format, isBefore } from "date-fns"
import { redirect } from "next/navigation"
import Link from "next/link"
import { requirePatientSession, getPatientFromSession } from "@/lib/auth-guard"
import { expandRefills, type PrescriptionLike } from "@/lib/schedule-utils"
import { Pill, ChevronLeft, AlertTriangle, RefreshCw, Package } from "lucide-react"

export const dynamic = "force-dynamic"

const REFILL_LABEL: Record<string, string> = {
  NONE: "One-time", MONTHLY: "Monthly", QUARTERLY: "Quarterly",
}

const REFILL_COLOR: Record<string, string> = {
  NONE: "bg-gray-100 text-gray-600",
  MONTHLY: "bg-green-50 text-green-700",
  QUARTERLY: "bg-violet-50 text-violet-700",
}

export default async function PrescriptionsPage() {
  await requirePatientSession()
  const patient = await getPatientFromSession()
  if (!patient) redirect("/")

  const now = new Date()
  const soonThreshold = addDays(now, 7)
  const threeMonths = addMonths(now, 3)

  const rxMap = new Map<number, { prescription: PrescriptionLike; refillDates: Date[] }>()
  const expanded = expandRefills(patient.prescriptions, now, threeMonths)
  for (const { prescription, refillDate } of expanded) {
    if (!rxMap.has(prescription.id)) {
      rxMap.set(prescription.id, { prescription, refillDates: [] })
    }
    rxMap.get(prescription.id)!.refillDates.push(refillDate)
  }

  const rows = Array.from(rxMap.values())

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
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
            <Pill className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Prescriptions</h1>
            <p className="text-sm text-gray-400">Upcoming refills · next 3 months</p>
          </div>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Pill className="w-6 h-6 text-gray-300" />
          </div>
          <p className="text-gray-600 font-medium">No upcoming refills</p>
          <p className="text-gray-400 text-sm mt-1">Nothing due in the next 3 months.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map(({ prescription: rx, refillDates }) => {
            const hasSoon = refillDates.some(d => !isBefore(soonThreshold, d))
            return (
              <div
                key={rx.id}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${hasSoon ? "border-amber-200" : "border-gray-100"}`}
              >
                {/* Medication header */}
                <div className={`px-5 py-4 flex items-center gap-4 ${hasSoon ? "bg-amber-50" : "bg-gray-50"} border-b ${hasSoon ? "border-amber-100" : "border-gray-100"}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${hasSoon ? "bg-amber-100" : "bg-white border border-gray-200"}`}>
                    <Pill className={`w-5 h-5 ${hasSoon ? "text-amber-600" : "text-gray-500"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-gray-900">{rx.medicationName}</p>
                      <span className="text-sm text-gray-500">{rx.dosage}</span>
                      {hasSoon && (
                        <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">
                          <AlertTriangle className="w-3 h-3" />
                          Due Soon
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Package className="w-3.5 h-3.5 text-gray-400" />
                        Qty: {rx.quantity}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <RefreshCw className="w-3.5 h-3.5 text-gray-400" />
                        {REFILL_LABEL[rx.refillSchedule]}
                      </div>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${REFILL_COLOR[rx.refillSchedule]}`}>
                    {REFILL_LABEL[rx.refillSchedule]}
                  </span>
                </div>

                {/* Refill dates */}
                <div className="px-5 py-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Upcoming Refill Dates</p>
                  <div className="flex flex-wrap gap-2">
                    {refillDates.map((d) => {
                      const soon = !isBefore(soonThreshold, d)
                      return (
                        <div
                          key={d.getTime()}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${
                            soon
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-gray-100 text-gray-700 border border-gray-200"
                          }`}
                        >
                          {soon && <AlertTriangle className="w-3.5 h-3.5" />}
                          {format(d, "MMM d, yyyy")}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
