import { addWeeks, addMonths, isBefore, isAfter } from "date-fns"

export type RepeatSchedule = "NONE" | "WEEKLY" | "BIWEEKLY" | "MONTHLY"
export type RefillSchedule = "NONE" | "MONTHLY" | "QUARTERLY"

export type AppointmentLike = {
  id: number
  patientId: number
  providerName: string
  dateTime: string | Date
  repeatSchedule: RepeatSchedule
  endDate: string | Date | null
  createdAt?: string | Date
  updatedAt?: string | Date
}

export type PrescriptionLike = {
  id: number
  patientId: number
  medicationName: string
  dosage: string
  quantity: number
  refillDate: string | Date
  refillSchedule: RefillSchedule
  createdAt?: string | Date
  updatedAt?: string | Date
}

export type AppointmentOccurrence = {
  appointment: AppointmentLike
  occurrenceDate: Date
}

export type RefillOccurrence = {
  prescription: PrescriptionLike
  refillDate: Date
}

function advanceAppt(date: Date, schedule: RepeatSchedule): Date {
  switch (schedule) {
    case "WEEKLY": return addWeeks(date, 1)
    case "BIWEEKLY": return addWeeks(date, 2)
    case "MONTHLY": return addMonths(date, 1)
    default: return date
  }
}

function advanceRefill(date: Date, schedule: RefillSchedule): Date {
  switch (schedule) {
    case "MONTHLY": return addMonths(date, 1)
    case "QUARTERLY": return addMonths(date, 3)
    default: return date
  }
}

export function expandAppointments(
  appointments: AppointmentLike[],
  fromDate: Date,
  toDate: Date,
): AppointmentOccurrence[] {
  const results: AppointmentOccurrence[] = []

  for (const appt of appointments) {
    const base = new Date(appt.dateTime)
    const endDate = appt.endDate ? new Date(appt.endDate) : null
    const effectiveEnd = endDate && isBefore(endDate, toDate) ? endDate : toDate

    if (appt.repeatSchedule === "NONE") {
      if (!isBefore(base, fromDate) && !isAfter(base, toDate)) {
        results.push({ appointment: appt, occurrenceDate: base })
      }
      continue
    }

    let current = new Date(base)
    while (isBefore(current, fromDate)) {
      current = advanceAppt(current, appt.repeatSchedule)
    }
    while (!isAfter(current, effectiveEnd)) {
      results.push({ appointment: appt, occurrenceDate: new Date(current) })
      current = advanceAppt(current, appt.repeatSchedule)
    }
  }

  return results.sort((a, b) => a.occurrenceDate.getTime() - b.occurrenceDate.getTime())
}

export function expandRefills(
  prescriptions: PrescriptionLike[],
  fromDate: Date,
  toDate: Date,
): RefillOccurrence[] {
  const results: RefillOccurrence[] = []

  for (const rx of prescriptions) {
    const base = new Date(rx.refillDate)

    if (rx.refillSchedule === "NONE") {
      if (!isBefore(base, fromDate) && !isAfter(base, toDate)) {
        results.push({ prescription: rx, refillDate: base })
      }
      continue
    }

    let current = new Date(base)
    while (isBefore(current, fromDate)) {
      current = advanceRefill(current, rx.refillSchedule)
    }
    while (!isAfter(current, toDate)) {
      results.push({ prescription: rx, refillDate: new Date(current) })
      current = advanceRefill(current, rx.refillSchedule)
    }
  }

  return results.sort((a, b) => a.refillDate.getTime() - b.refillDate.getTime())
}
