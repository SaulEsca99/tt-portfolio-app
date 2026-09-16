import "dotenv/config";
import { db } from "./index";
import { donorProfile, medication, user } from "./schema";
import { extraUsers, mockMedications } from "./seed-data";

async function main() {
  console.log("🗑️  Limpiando tabla de medicamentos...");
  await db.delete(medication);

  console.log("⏳ Iniciando proceso de seeding...");

  for (const item of mockMedications) {
    const [u] = await db
      .insert(user)
      .values({
        id: crypto.randomUUID(),
        name: item.donorName,
        email: item.donorEmail,
        image: item.donorAvatar,
        isDonor: true,
        onboardingCompleted: true,
      })
      .onConflictDoUpdate({
        target: user.email,
        set: { name: item.donorName, image: item.donorAvatar },
      })
      .returning();

    await db
      .insert(donorProfile)
      .values({
        userId: u.id,
        fullName: item.donorName,
        verificationStatus: "verified",
      })
      .onConflictDoNothing();

    await db.insert(medication).values({
      donorId: u.id,
      activeSubstance: item.activeSubstance,
      dosage: item.dosage,
      quantity: item.quantity,
      brand: item.brand,
      presentation: item.presentation,
      expiryDate: item.expiryDate,
      lotNumber: item.lotNumber,
      laboratory: item.laboratory,
      photoUrl: item.photoUrl,
      location: item.location,
      postalCode: item.postalCode,
      preferredSchedule: item.preferredSchedule,
      description: item.description,
      status: item.status,
      isControlled: item.isControlled,
      isVisible: true,
    });

    console.log(
      `✅ Medicamento insertado: ${item.activeSubstance} (${item.brand})`
    );
  }

  // Usuarios adicionales
  for (const uData of extraUsers) {
    await db
      .insert(user)
      .values({
        id: crypto.randomUUID(),
        name: uData.name,
        email: uData.email,
        isBeneficiary: uData.isBeneficiary,
      })
      .onConflictDoNothing();
  }

  console.log("🙌 Seeding completado exitosamente.");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Error en el seeding:", err);
  process.exit(1);
});
