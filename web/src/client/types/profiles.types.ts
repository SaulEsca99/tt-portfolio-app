export interface CreateDonorProfile {
  userId: string;
  fullName: string;
  phone?: string;
  donorType?: "individual" | "pharmacy" | "hospital" | "clinic" | "ngo";
  organization?: string;
  idDocument?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  medicalLicense?: string;
  bio?: string;
  profilePicture?: string;
}

export interface UpdateDonorProfile {
  fullName?: string;
  phone?: string;
  donorType?: "individual" | "pharmacy" | "hospital" | "clinic" | "ngo";
  organization?: string;
  idDocument?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  medicalLicense?: string;
  bio?: string;
  profilePicture?: string;
}

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

export interface CreateRecipientProfile {
  userId: string;
  fullName: string;
  phone?: string;
  dateOfBirth?: string;
  recipientType?: "individual" | "family" | "community_organization";
  idDocument?: string;
  socialSecurityNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  employmentStatus?:
    | "employed"
    | "unemployed"
    | "retired"
    | "student"
    | "self-employed";
  monthlyIncome?:
    | "none"
    | "low"
    | "medium-low"
    | "medium"
    | "medium-high"
    | "high";
  hasHealthInsurance?: boolean;
  insuranceProvider?: string;
  chronicConditions?: string;
  allergies?: string;
  currentMedications?: string;
  disabilities?: string;
  bio?: string;
  profilePicture?: string;
}

export interface UpdateRecipientProfile {
  fullName?: string;
  phone?: string;
  dateOfBirth?: string;
  recipientType?: "individual" | "family" | "community_organization";
  idDocument?: string;
  socialSecurityNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  employmentStatus?:
    | "employed"
    | "unemployed"
    | "retired"
    | "student"
    | "self-employed";
  monthlyIncome?:
    | "none"
    | "low"
    | "medium-low"
    | "medium"
    | "medium-high"
    | "high";
  hasHealthInsurance?: boolean;
  insuranceProvider?: string;
  chronicConditions?: string;
  allergies?: string;
  currentMedications?: string;
  disabilities?: string;
  bio?: string;
  profilePicture?: string;
}

export interface RecipientProfileResponse {
  id: number;
  userId: string;
  fullName: string;
  phone?: string;
  dateOfBirth?: string;

  recipientType: "individual" | "family" | "community_organization";

  idDocument: string;
  socialSecurityNumber?: string;

  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;

  employmentStatus:
    | "employed"
    | "unemployed"
    | "self-employed"
    | "retired"
    | "student";
  monthlyIncome:
    | "none"
    | "low"
    | "medium-low"
    | "medium"
    | "medium-high"
    | "high";

  hasHealthInsurance: boolean;
  insuranceProvider?: string;
  socioeconomicScore?: number;

  chronicConditions?: string;
  allergies?: string;
  currentMedications?: string;
  disabilities?: string;

  verificationStatus: "pending" | "verified" | "rejected";
  verificationDocument?: string;
  economicProof?: string;
  verifiedAt?: string;

  totalRequests: number;
  totalMedicationsReceived: number;
  totalReceived: number;

  profilePicture?: string;
  bio?: string;
  isActive: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface UploadDocument {
  profileId: number;
  documentType: "verification" | "economic_proof";
  documentUrl: string;
}

export interface VerifyRecipientProfile {
  recipientProfileId: number;
  verified: boolean;
  socioeconomicScore?: number;
  verificationDocument?: string;
}
