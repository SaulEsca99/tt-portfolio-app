import { getSession } from "@/app/lib/auth";
import { RecipientProfileRepository } from "@/server/modules/identity/features/profile/recipient/recipient-profile.repository";
import { UploadRecipientDocumentUseCase } from "@/server/modules/identity/features/profile/recipient/recipient-profile.use-case";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const recipientRepository = new RecipientProfileRepository();

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const userId = session.user.id;

    const body = await req.json();
    const useCase = new UploadRecipientDocumentUseCase(recipientRepository);

    const profile = await useCase.execute(userId, body);

    return NextResponse.json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.message },
        { status: 400 }
      );
    }

    console.error("Error al subir documento:", error);
    return NextResponse.json(
      { error: "Error al subir documento" },
      { status: 500 }
    );
  }
}
