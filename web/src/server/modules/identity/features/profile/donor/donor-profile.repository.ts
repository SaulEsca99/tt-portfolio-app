/* eslint-disable @typescript-eslint/no-explicit-any */
import { DonorProfileResponseDTO } from "./donor-profile.dto";

import { db } from "@/server/db";
import { donorProfile } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export interface IDonorProfileRepository {
  create(data: any): Promise<DonorProfileResponseDTO>;
  update(id: number, data: any): Promise<DonorProfileResponseDTO>;
  findById(id: number): Promise<DonorProfileResponseDTO | null>;
  findByUserId(userId: string): Promise<DonorProfileResponseDTO | null>;
  delete(id: number): Promise<void>;
}

export class DonorProfileRepository implements IDonorProfileRepository {
  async create(data: any): Promise<DonorProfileResponseDTO> {
    const [profile] = await db.insert(donorProfile).values(data).returning();
    return profile as DonorProfileResponseDTO;
  }

  async update(id: number, data: any): Promise<DonorProfileResponseDTO> {
    const [profile] = await db
      .update(donorProfile)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(donorProfile.id, id))
      .returning();

    if (!profile) {
      throw new Error("Perfil no encontrado");
    }

    return profile as DonorProfileResponseDTO;
  }

  async findById(id: number): Promise<DonorProfileResponseDTO | null> {
    const [profile] = await db
      .select()
      .from(donorProfile)
      .where(eq(donorProfile.id, id));

    return (profile as DonorProfileResponseDTO) || null;
  }

  async findByUserId(userId: string): Promise<DonorProfileResponseDTO | null> {
    const [profile] = await db
      .select()
      .from(donorProfile)
      .where(eq(donorProfile.userId, userId));

    return (profile as DonorProfileResponseDTO) || null;
  }

  async delete(id: number): Promise<void> {
    await db.delete(donorProfile).where(eq(donorProfile.id, id));
  }
}
