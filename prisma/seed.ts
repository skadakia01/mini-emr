import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

type RepeatValue = "weekly" | "biweekly" | "monthly" | string
type RefillValue = "monthly" | "quarterly" | string

function toRepeatSchedule(repeat: RepeatValue) {
  switch (repeat?.toLowerCase()) {
    case "weekly": return "WEEKLY" as const
    case "biweekly": return "BIWEEKLY" as const
    case "monthly": return "MONTHLY" as const
    default: return "NONE" as const
  }
}

function toRefillSchedule(schedule: RefillValue) {
  switch (schedule?.toLowerCase()) {
    case "monthly": return "MONTHLY" as const
    case "quarterly": return "QUARTERLY" as const
    default: return "NONE" as const
  }
}

async function main() {
  const rawUrl =
    "https://gist.githubusercontent.com/sbraford/73f63d75bb995b6597754c1707e40cc2/raw/"
  const res = await fetch(rawUrl)
  if (!res.ok) throw new Error(`Failed to fetch seed data: ${res.statusText}`)
  const data = await res.json()

  await prisma.prescription.deleteMany()
  await prisma.appointment.deleteMany()
  await prisma.patient.deleteMany()

  for (const user of data.users) {
    const [firstName, ...rest] = (user.name as string).split(" ")
    const lastName = rest.join(" ")
    const hashedPassword = await bcrypt.hash(user.password, 12)

    const patient = await prisma.patient.create({
      data: {
        firstName,
        lastName,
        email: user.email,
        password: hashedPassword,
      },
    })

    for (const appt of user.appointments ?? []) {
      await prisma.appointment.create({
        data: {
          patientId: patient.id,
          providerName: appt.provider,
          dateTime: new Date(appt.datetime),
          repeatSchedule: toRepeatSchedule(appt.repeat),
        },
      })
    }

    for (const rx of user.prescriptions ?? []) {
      await prisma.prescription.create({
        data: {
          patientId: patient.id,
          medicationName: rx.medication,
          dosage: rx.dosage,
          quantity: rx.quantity,
          refillDate: new Date(rx.refill_on),
          refillSchedule: toRefillSchedule(rx.refill_schedule),
        },
      })
    }
  }

  console.log(`Seeded ${data.users.length} patients with appointments and prescriptions.`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
