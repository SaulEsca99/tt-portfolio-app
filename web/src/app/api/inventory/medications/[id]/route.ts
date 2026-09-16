import { auth } from "@/app/lib/auth";
import { updateMedicationSchema } from "@/server/modules/inventory/features/medications/dtos/medication.dto";
import {
  getMedicationById,
  updateMedicationStatus,
} from "@/server/modules/inventory/features/medications/use-cases/medication.use-cases";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await getMedicationById(Number(id));
  return NextResponse.json(result, { status: result.success ? 200 : 404 });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;

  try {
    const body = await req.json();

    // Pre-procesamiento de fecha si viene en el update
    const formattedBody = {
      ...body,
      expiryDate: body.expiryDate ? new Date(body.expiryDate) : undefined,
    };

    const resultValidation = updateMedicationSchema.safeParse(formattedBody);

    if (!resultValidation.success) {
      return NextResponse.json(
        { error: resultValidation.error.format() },
        { status: 400 }
      );
    }

    // Aquí usamos el status del esquema validado
    const result = await updateMedicationStatus(
      Number(id),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      resultValidation.data.status as any
    );

    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Error al procesar la actualización" },
      { status: 400 }
    );
  }
}
