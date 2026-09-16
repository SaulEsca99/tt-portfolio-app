import { apiFetch } from "@/client/lib/api-client";
import {
  DonorProfileResponse,
  RecipientProfileResponse,
} from "@/client/types/profiles.types";

export function getDonorProfileService() {
  return apiFetch<DonorProfileResponse>("/api/identity/profiles/donor");
}

export function createDonorProfileService(data: unknown) {
  return apiFetch<DonorProfileResponse>("/api/identity/profiles/donor", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateDonorProfileService(data: unknown) {
  return apiFetch<DonorProfileResponse>("/api/identity/profiles/donor", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function getRecipientProfileService() {
  return apiFetch<RecipientProfileResponse>("/api/identity/profiles/recipient");
}

export function createRecipientProfileService(data: unknown) {
  return apiFetch<RecipientProfileResponse>(
    "/api/identity/profiles/recipient",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export function updateRecipientProfileService(data: unknown) {
  return apiFetch<RecipientProfileResponse>(
    "/api/identity/profiles/recipient",
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );
}

export function uploadRecipientDocumentService(data: {
  documentType: "verification" | "economic_proof";
  documentUrl: string;
}) {
  return apiFetch<RecipientProfileResponse>(
    "/api/identity/profiles/recipient/documents",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}
