import { queryOptions } from "@tanstack/react-query";
import {
  getDonorProfileService,
  getRecipientProfileService,
} from "../services/profile.service";

export const profileQueries = {
  donor: () =>
    queryOptions({
      queryKey: ["profile", "donor"],
      queryFn: getDonorProfileService,
      staleTime: 5 * 60 * 1000,
    }),

  recipient: () =>
    queryOptions({
      queryKey: ["profile", "recipient"],
      queryFn: getRecipientProfileService,
      staleTime: 5 * 60 * 1000,
    }),
};
