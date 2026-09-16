import { getSession } from "@/app/lib/auth";
import { RecipientProfileRepository } from "@/server/modules/identity/features/profile/recipient/recipient-profile.repository";
import {
  CreateRecipientProfileUseCase,
  GetRecipientProfileUseCase,
  UpdateRecipientProfileUseCase,
} from "@/server/modules/identity/features/profile/recipient/recipient-profile.use-case";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const recipientRepository = new RecipientProfileRepository();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_req: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const userId = session.user.id;

    const useCase = new GetRecipientProfileUseCase(recipientRepository);
    const profile = await useCase.execute(userId);

    if (!profile) {
      return NextResponse.json(
        { error: "Perfil no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    return NextResponse.json(
      { error: "Error al obtener perfil" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const useCase = new CreateRecipientProfileUseCase(recipientRepository);

    const profile = await useCase.execute({
      ...body,
      userId,
    });

    return NextResponse.json(profile, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.message },
        { status: 400 }
      );
    }

    if (
      error instanceof Error &&
      error.message.includes("ya tiene un perfil")
    ) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    console.error("Error al crear perfil:", error);
    return NextResponse.json(
      { error: "Error al crear perfil" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const userId = session.user.id;

    const body = await req.json();

    const useCase = new UpdateRecipientProfileUseCase(recipientRepository);

    const profile = await useCase.execute(userId, body);

    return NextResponse.json(profile);
  } catch (error) {
    console.log(error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.message },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes("no encontrado")) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    console.error("Error al actualizar perfil:", error);
    return NextResponse.json(
      { error: "Error al actualizar perfil" },
      { status: 500 }
    );
  }
}
