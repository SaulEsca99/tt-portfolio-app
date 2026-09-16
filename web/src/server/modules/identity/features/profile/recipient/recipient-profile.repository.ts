/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/server/db";
import { recipientProfile } from "@/server/db/schema";

import { eq } from "drizzle-orm";

import { RecipientProfileResponseDTO } from "./recipient-profile.dto";

export interface IRecipientProfileRepository {
  create(data: unknown): Promise<RecipientProfileResponseDTO>;
  update(id: number, data: unknown): Promise<RecipientProfileResponseDTO>;
  findById(id: number): Promise<RecipientProfileResponseDTO | null>;
  findByUserId(userId: string): Promise<RecipientProfileResponseDTO | null>;
  delete(id: number): Promise<void>;
}

export class RecipientProfileRepository implements IRecipientProfileRepository {
  async create(data: any): Promise<RecipientProfileResponseDTO> {
    const [profile] = await db
      .insert(recipientProfile)
      .values(data)
      .returning();
    return profile as RecipientProfileResponseDTO;
  }

  async update(id: number, data: any): Promise<RecipientProfileResponseDTO> {
    const [profile] = await db
      .update(recipientProfile)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(recipientProfile.id, id))
      .returning();

    if (!profile) {
      throw new Error("Perfil no encontrado");
    }

    return profile as RecipientProfileResponseDTO;
  }

  async findById(id: number): Promise<RecipientProfileResponseDTO | null> {
    const [profile] = await db
      .select()
      .from(recipientProfile)
      .where(eq(recipientProfile.id, id));

    return (profile as RecipientProfileResponseDTO) || null;
  }

  async findByUserId(
    userId: string
  ): Promise<RecipientProfileResponseDTO | null> {
    const [profile] = await db
      .select()
      .from(recipientProfile)
      .where(eq(recipientProfile.userId, userId));

    return (profile as RecipientProfileResponseDTO) || null;
  }

  async delete(id: number): Promise<void> {
    await db.delete(recipientProfile).where(eq(recipientProfile.id, id));
  }
}
