import { db } from "@/server/db";
import {
  createDonorProfileSchema,
  DonorProfileResponseDTO,
  updateDonorProfileSchema,
  verifyDonorMedicalLicenseSchema,
} from "./donor-profile.dto";

import { user } from "@/server/db/schema";
import { IDonorProfileRepository } from "./donor-profile.repository";

export class CreateDonorProfileUseCase {
  constructor(private donorProfileRepository: IDonorProfileRepository) {}

  async execute(input: unknown): Promise<DonorProfileResponseDTO> {
    // Validar datos de entrada con Zod
    const dto = createDonorProfileSchema.parse(input);

    // Validar que el usuario no tenga ya un perfil de donante
    const existingProfile = await this.donorProfileRepository.findByUserId(
      dto.userId
    );
    if (existingProfile) {
      throw new Error("El usuario ya tiene un perfil de donante");
    }

    // Crear el perfil
    const profile = await this.donorProfileRepository.create({
      ...dto,
      verificationStatus: "pending" as const,
      medicalLicenseVerified: false,
      totalDonations: 0,
      totalMedicationsDonated: 0,
      recentDonations: 0,
      isActive: true,
    });

    return profile;
  }
}

export class UpdateDonorProfileUseCase {
  constructor(private donorProfileRepository: IDonorProfileRepository) {}

  async execute(
    userId: string,
    input: unknown
  ): Promise<DonorProfileResponseDTO> {
    const dto = updateDonorProfileSchema.parse(input);

    const profile = await this.donorProfileRepository.findByUserId(userId);
    if (!profile) {
      throw new Error("Perfil de donante no encontrado");
    }

    const updatedProfile = await this.donorProfileRepository.update(
      profile.id,
      dto
    );
    return updatedProfile;
  }
}

export class GetDonorProfileUseCase {
  constructor(private donorProfileRepository: IDonorProfileRepository) {}

  async execute(userId: string): Promise<DonorProfileResponseDTO | null> {
    if (!userId || typeof userId !== "string") {
      throw new Error("User ID inválido");
    }

    const profile = await this.donorProfileRepository.findByUserId(userId);

    await db.update(user).set({ isDonor: true });
    return profile;
  }
}

export class VerifyDonorMedicalLicenseUseCase {
  constructor(private donorProfileRepository: IDonorProfileRepository) {}

  async execute(input: unknown): Promise<DonorProfileResponseDTO> {
    // Validar datos de entrada con Zod
    const dto = verifyDonorMedicalLicenseSchema.parse(input);

    const profile = await this.donorProfileRepository.findById(
      dto.donorProfileId
    );
    if (!profile) {
      throw new Error("Perfil de donante no encontrado");
    }

    const updatedProfile = await this.donorProfileRepository.update(
      dto.donorProfileId,
      {
        medicalLicenseVerified: dto.verified,
        verificationDocument: dto.verificationDocument,
        verifiedAt: dto.verified ? new Date() : null,
        verificationStatus: dto.verified ? "verified" : "rejected",
      }
    );

    return updatedProfile;
  }
}

export class IncrementDonorStatsUseCase {
  constructor(private donorProfileRepository: IDonorProfileRepository) {}

  async execute(userId: string, medicationsCount: number): Promise<void> {
    if (!userId || typeof userId !== "string") {
      throw new Error("User ID inválido");
    }

    if (medicationsCount < 0) {
      throw new Error("El número de medicamentos debe ser positivo");
    }

    const profile = await this.donorProfileRepository.findByUserId(userId);
    if (!profile) {
      throw new Error("Perfil de donante no encontrado");
    }

    await this.donorProfileRepository.update(profile.id, {
      totalDonations: profile.totalDonations + 1,
      totalMedicationsDonated:
        profile.totalMedicationsDonated + medicationsCount,
      recentDonations: profile.recentDonations + 1,
    });
  }
}
