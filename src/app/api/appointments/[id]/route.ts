import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { dateTime, endDate, ...rest } = body

    const updateData: Record<string, any> = { ...rest }
    if (dateTime) updateData.dateTime = new Date(dateTime)
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null

    const appointment = await prisma.appointment.update({
      where: { id: Number(id) },
      data: updateData,
    })

    return Response.json({ data: appointment })
  } catch (e: any) {
    if (e?.code === "P2025") {
      return Response.json({ error: "Appointment not found" }, { status: 404 })
    }
    return Response.json({ error: "Failed to update appointment" }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.appointment.delete({ where: { id: Number(id) } })
    return Response.json({ data: { deleted: true } })
  } catch (e: any) {
    if (e?.code === "P2025") {
      return Response.json({ error: "Appointment not found" }, { status: 404 })
    }
    return Response.json({ error: "Failed to delete appointment" }, { status: 500 })
  }
}
