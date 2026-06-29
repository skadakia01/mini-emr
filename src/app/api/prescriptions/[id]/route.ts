import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { refillDate, quantity, ...rest } = body

    const updateData: Record<string, any> = { ...rest }
    if (refillDate) updateData.refillDate = new Date(refillDate)
    if (quantity !== undefined) updateData.quantity = Number(quantity)

    const prescription = await prisma.prescription.update({
      where: { id: Number(id) },
      data: updateData,
    })

    return Response.json({ data: prescription })
  } catch (e: any) {
    if (e?.code === "P2025") {
      return Response.json({ error: "Prescription not found" }, { status: 404 })
    }
    return Response.json({ error: "Failed to update prescription" }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.prescription.delete({ where: { id: Number(id) } })
    return Response.json({ data: { deleted: true } })
  } catch (e: any) {
    if (e?.code === "P2025") {
      return Response.json({ error: "Prescription not found" }, { status: 404 })
    }
    return Response.json({ error: "Failed to delete prescription" }, { status: 500 })
  }
}
