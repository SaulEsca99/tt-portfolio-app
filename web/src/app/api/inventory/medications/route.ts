import { auth } from "@/app/lib/auth";

import {
  createMedicationSchema,
  searchMedicationsSchema,
} from "@/server/modules/inventory/features/medications/dtos/medication.dto";
import { createMedication } from "@/server/modules/inventory/features/medications/use-cases/medication.use-cases";
import { searchMedications } from "@/server/modules/inventory/features/medications/use-cases/search-medications.use-case";

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // Get user session to filter own medications if needed
  const session = await auth.api.getSession({ headers: req.headers });

  const rawParams = {
    activeSubstance: searchParams.get("activeSubstance") || undefined,
    dosage: searchParams.get("dosage") || undefined,
    postalCode: searchParams.get("postalCode") || undefined,
    status: searchParams.get("status") || undefined,
    maxDistance: searchParams.get("maxDistance")
      ? Number(searchParams.get("maxDistance"))
      : undefined,
    onlyVisible: searchParams.get("onlyVisible") === "false" ? false : true,
    excludeOwnMedications: searchParams.get("excludeOwnMedications") === "true",
  };

  const resultValidation = searchMedicationsSchema.safeParse(rawParams);

  if (!resultValidation.success) {
    return NextResponse.json(
      { error: resultValidation.error.format() },
      { status: 400 }
    );
  }

  const result = await searchMedications(
    resultValidation.data,
    session?.user?.id // Pass userId to filter
  );
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const body = await req.json();

    const resultValidation = createMedicationSchema.safeParse({
      ...body,
      expiryDate: body.expiryDate ? new Date(body.expiryDate) : undefined,
    });

    if (!resultValidation.success) {
      console.log(resultValidation.error);

      return NextResponse.json(
        {
          success: false,
          error: "Validación fallida",
          details: resultValidation.error.format(),
        },
        { status: 400 }
      );
    }

    const result = await createMedication(
      session.user.id,
      resultValidation.data
    );
    return NextResponse.json(result, { status: result.success ? 201 : 400 });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { error: "Cuerpo de solicitud inválido" },
      { status: 400 }
    );
  }
}
