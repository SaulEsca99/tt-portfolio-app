import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { profileQueries } from "../queries/profile.queries";
import {
  createDonorProfileService,
  createRecipientProfileService,
  updateDonorProfileService,
  updateRecipientProfileService,
  uploadRecipientDocumentService,
} from "../services/profile.service";

// ===== Donor Profile Hooks =====

export function useDonorProfile() {
  return useQuery(profileQueries.donor());
}

export function useCreateDonorProfile(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDonorProfileService,
    onSuccess: (data) => {
      queryClient.setQueryData(["profile", "donor"], data);
      options?.onSuccess?.();
    },
  });
}

export function useUpdateDonorProfile(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateDonorProfileService,
    onSuccess: (data) => {
      queryClient.setQueryData(["profile", "donor"], data);
      options?.onSuccess?.();
    },
  });
}

// ===== Recipient Profile Hooks =====

export function useRecipientProfile() {
  return useQuery(profileQueries.recipient());
}

export function useCreateRecipientProfile(options?: {
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRecipientProfileService,
    onSuccess: (data) => {
      queryClient.setQueryData(["profile", "recipient"], data);
      options?.onSuccess?.();
    },
  });
}

export function useUpdateRecipientProfile(options?: {
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateRecipientProfileService,
    onSuccess: (data) => {
      queryClient.setQueryData(["profile", "recipient"], data);
      options?.onSuccess?.();
    },
  });
}

export function useUploadRecipientDocument(options?: {
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadRecipientDocumentService,
    onSuccess: (data) => {
      queryClient.setQueryData(["profile", "recipient"], data);
      options?.onSuccess?.();
    },
  });
}
