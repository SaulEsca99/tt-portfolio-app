import { DonorProfilePayload } from "./donor-profile.schema";

export interface DonorProfileResponse {
  id: number;
  userId: string;
  fullName: string;
  phone?: string;

  donorType?: string;

  organization?: string;
  idDocument?: string;

  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;

  medicalLicense?: string;
  medicalLicenseVerified: boolean;

  verificationStatus: "pending" | "verified" | "rejected";
  verificationDocument?: string;
  verifiedAt?: string;

  totalDonations: number;
  totalMedicationsDonated: number;
  recentDonations: number;

  profilePicture?: string;
  bio?: string;
  isActive: boolean;

  createdAt: string;
  updatedAt: string;
}

export function convertDonorResponseToPayload(
  response?: DonorProfileResponse
): DonorProfilePayload | undefined {
  if (!response) return undefined;

  return {
    fullName: response.fullName,
    phone: response.phone,

    donorType:
      (response.donorType as
        | "individual"
        | "pharmacy"
        | "hospital"
        | "clinic"
        | "ngo") || "individual",

    organization: response.organization,
    idDocument: response.idDocument,

    address: response.address,
    city: response.city,
    state: response.state,
    postalCode: response.postalCode,
    country: response.country || "México",

    medicalLicense: response.medicalLicense,

    verificationDocument: response.verificationDocument,

    profilePicture: response.profilePicture,
    bio: response.bio,
  };
}
