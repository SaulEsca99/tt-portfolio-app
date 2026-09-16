import {
  createRecipientProfileSchema,
  RecipientProfileResponseDTO,
  updateRecipientProfileSchema,
  uploadDocumentSchema,
  verifyRecipientProfileSchema,
} from "./recipient-profile.dto";
import { IRecipientProfileRepository } from "./recipient-profile.repository";

export class CreateRecipientProfileUseCase {
  constructor(
    private recipientProfileRepository: IRecipientProfileRepository
  ) {}

  async execute(input: unknown): Promise<RecipientProfileResponseDTO> {
    // Validar datos de entrada con Zod
    const dto = createRecipientProfileSchema.parse(input);

    // Validar que el usuario no tenga ya un perfil de beneficiario
    const existingProfile = await this.recipientProfileRepository.findByUserId(
      dto.userId
    );
    if (existingProfile) {
      throw new Error("El usuario ya tiene un perfil de beneficiario");
    }

    // Crear el perfil
    const profile = await this.recipientProfileRepository.create({
      ...dto,
      verificationStatus: "pending" as const,
      hasHealthInsurance: dto.hasHealthInsurance ?? false,
      totalRequests: 0,
      totalMedicationsReceived: 0,
      totalReceived: 0,
      isActive: true,
    });

    return profile;
  }
}

export class UpdateRecipientProfileUseCase {
  constructor(
    private recipientProfileRepository: IRecipientProfileRepository
  ) {}

  async execute(
    userId: string,
    input: unknown
  ): Promise<RecipientProfileResponseDTO> {
    const dto = updateRecipientProfileSchema.parse(input);

    const profile = await this.recipientProfileRepository.findByUserId(userId);
    if (!profile) {
      throw new Error("Perfil de beneficiario no encontrado");
    }

    const updatedProfile = await this.recipientProfileRepository.update(
      profile.id,
      dto
    );
    return updatedProfile;
  }
}

export class GetRecipientProfileUseCase {
  constructor(
    private recipientProfileRepository: IRecipientProfileRepository
  ) {}

  async execute(userId: string): Promise<RecipientProfileResponseDTO | null> {
    if (!userId || typeof userId !== "string") {
      throw new Error("User ID inválido");
    }

    const profile = await this.recipientProfileRepository.findByUserId(userId);
    return profile;
  }
}

export class UploadRecipientDocumentUseCase {
  constructor(
    private recipientProfileRepository: IRecipientProfileRepository
  ) {}

  async execute(
    userId: string,
    input: unknown
  ): Promise<RecipientProfileResponseDTO> {
    const dto = uploadDocumentSchema.parse(input);

    const profile = await this.recipientProfileRepository.findByUserId(userId);
    if (!profile) {
      throw new Error("Perfil de beneficiario no encontrado");
    }

    const updateData: Partial<RecipientProfileResponseDTO> = {};

    if (dto.documentType === "verification") {
      updateData.verificationDocument = dto.documentUrl;
    } else if (dto.documentType === "economic_proof") {
      updateData.economicProof = dto.documentUrl;
    }

    const updatedProfile = await this.recipientProfileRepository.update(
      profile.id,
      updateData
    );
    return updatedProfile;
  }
}

export class VerifyRecipientProfileUseCase {
  constructor(
    private recipientProfileRepository: IRecipientProfileRepository
  ) {}

  async execute(input: unknown): Promise<RecipientProfileResponseDTO> {
    // Validar datos de entrada con Zod
    const dto = verifyRecipientProfileSchema.parse(input);

    const profile = await this.recipientProfileRepository.findById(
      dto.recipientProfileId
    );
    if (!profile) {
      throw new Error("Perfil de beneficiario no encontrado");
    }

    const updatedProfile = await this.recipientProfileRepository.update(
      dto.recipientProfileId,
      {
        verificationStatus: dto.verified ? "verified" : "rejected",
        verifiedAt: dto.verified ? new Date() : null,
        socioeconomicScore: dto.socioeconomicScore,
        verificationDocument: dto.verificationDocument,
      }
    );

    return updatedProfile;
  }
}

export class IncrementRecipientStatsUseCase {
  constructor(
    private recipientProfileRepository: IRecipientProfileRepository
  ) {}

  async execute(userId: string, medicationsCount: number): Promise<void> {
    if (!userId || typeof userId !== "string") {
      throw new Error("User ID inválido");
    }

    if (medicationsCount < 0) {
      throw new Error("El número de medicamentos debe ser positivo");
    }

    const profile = await this.recipientProfileRepository.findByUserId(userId);
    if (!profile) {
      throw new Error("Perfil de beneficiario no encontrado");
    }

    await this.recipientProfileRepository.update(profile.id, {
      totalRequests: profile.totalRequests + 1,
      totalMedicationsReceived:
        profile.totalMedicationsReceived + medicationsCount,
      totalReceived: profile.totalReceived + medicationsCount,
    });
  }
}

export class CalculateSocioeconomicScoreUseCase {
  async execute(profile: RecipientProfileResponseDTO): Promise<number> {
    let score = 0;

    const employmentScores: Record<string, number> = {
      unemployed: 30,
      student: 25,
      retired: 20,
      "self-employed": 15,
      employed: 5,
    };
    score += employmentScores[profile.employmentStatus || ""] || 0;

    const incomeScores: Record<string, number> = {
      none: 40,
      low: 35,
      "medium-low": 25,
      medium: 15,
      "medium-high": 5,
      high: 0,
    };
    score += incomeScores[profile.monthlyIncome || ""] || 0;

    if (!profile.hasHealthInsurance) {
      score += 20;
    }

    if (profile.chronicConditions && profile.chronicConditions.length > 0) {
      const conditionsCount = profile.chronicConditions.split(",").length;
      score += Math.min(conditionsCount * 3, 10);
    }

    return Math.min(score, 100);
  }
}
