import { auth } from "@/app/lib/auth";
import { getMedicationsByDonor } from "@/server/modules/inventory/features/medications/use-cases/medication.use-cases";
import { NextRequest, NextResponse } from "next/server";

// GET /api/medications/donor -> Obtiene el inventario personal del usuario logueado
export async function GET(req: NextRequest) {
  // 1. Validar Sesión
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: "No autorizado. Debes iniciar sesión." },
      { status: 401 }
    );
  }

  // 2. Ejecutar Caso de Uso
  // Usamos el ID del usuario de la sesión para asegurar que solo vea sus datos
  const result = await getMedicationsByDonor(session.user.id);

  // 3. Responder
  if (!result.success) {
    return NextResponse.json(
      {
        success: false,
        error: result.error || "Error al obtener tus medicamentos",
      },
      { status: 500 }
    );
  }

  return NextResponse.json(result);
}
