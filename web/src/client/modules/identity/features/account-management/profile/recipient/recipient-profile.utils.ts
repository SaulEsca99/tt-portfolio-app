import { RecipientProfileResponse } from "@/client/types/profiles.types";

import { RecipientProfilePayload } from "./recipient-profile.schema";

export function convertRecipientResponseToPayload(
  response?: RecipientProfileResponse
): RecipientProfilePayload | undefined {
  if (!response) return undefined;

  return {
    fullName: response.fullName,
    phone: response.phone,
    dateOfBirth: response.dateOfBirth
      ? new Date(response.dateOfBirth)
      : undefined,

    recipientType: response.recipientType || "individual",

    idDocument: response.idDocument || "",
    socialSecurityNumber: response.socialSecurityNumber,

    address: response.address || "",
    city: response.city || "",
    state: response.state || "",
    postalCode: response.postalCode || "",
    country: response.country || "México",

    employmentStatus: response.employmentStatus,
    monthlyIncome: response.monthlyIncome,

    hasHealthInsurance: response.hasHealthInsurance ?? false,
    insuranceProvider: response.insuranceProvider,

    chronicConditions: response.chronicConditions,
    allergies: response.allergies,
    currentMedications: response.currentMedications,
    disabilities: response.disabilities,

    economicProof: response.economicProof,
    verificationDocument: response.verificationDocument,
  };
}
