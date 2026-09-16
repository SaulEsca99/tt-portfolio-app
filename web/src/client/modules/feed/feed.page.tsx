import { UserProfile } from "@/client/types/user";
import { Suspense } from "react";

import { QueryErrorBoundary } from "@/client/components/query-error-boundary";
import {
  MedicationList,
  MedicationListSkeleton,
} from "../inventory/components/medication-list";
import { CreateMedicationModal } from "../inventory/features/create-medication/create-medication-dialog";
import { FeedInputTrigger } from "./components/feed-input-trigger";
import { RequestMedicationModalWrapper } from "../matchmaking/components/request-medication-modal-wrapper";

export async function FeedPage({ user }: { user?: UserProfile }) {
  return (
    <main className="container mx-auto max-w-2xl px-4 py-6">
      <FeedInputTrigger user={user} />

      <div className="space-y-4 divide-y divide-border">
        <QueryErrorBoundary>
          <Suspense fallback={<MedicationListSkeleton />}>
            <MedicationList />
          </Suspense>
        </QueryErrorBoundary>
      </div>

      <CreateMedicationModal userId={user?.id} isDonor={user?.isDonor} />
      <RequestMedicationModalWrapper />
    </main>
  );
}
