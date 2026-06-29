import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const patientId = request.nextUrl.searchParams.get("patientId")
    if (!patientId) {
      return Response.json({ error: "patientId query param is required" }, { status: 400 })
    }

    const appointments = await prisma.appointment.findMany({
      where: { patientId: Number(patientId) },
      orderBy: { dateTime: "asc" },
    })

    return Response.json({ data: appointments })
  } catch {
    return Response.json({ error: "Failed to fetch appointments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { patientId, providerName, dateTime, repeatSchedule, endDate } = body

    if (!patientId || !providerName || !dateTime) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId: Number(patientId),
        providerName,
        dateTime: new Date(dateTime),
        repeatSchedule: repeatSchedule ?? "NONE",
        endDate: endDate ? new Date(endDate) : null,
      },
    })

    return Response.json({ data: appointment }, { status: 201 })
  } catch {
    return Response.json({ error: "Failed to create appointment" }, { status: 500 })
  }
}
