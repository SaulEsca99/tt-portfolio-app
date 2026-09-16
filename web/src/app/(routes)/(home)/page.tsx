import { getSession } from "@/app/lib/auth";
import { getQueryClient } from "@/client/lib/get-query-client";
import { FeedPage } from "@/client/modules/feed/feed.page";
import { medicationQueries } from "@/client/modules/inventory/queries/medication.queries";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

export default async function HomePage() {
  const session = await getSession();
  const queryClient = getQueryClient();

  const filters = {
    onlyVisible: false,
  };
  await queryClient.prefetchQuery(medicationQueries.search(filters));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <FeedPage user={session?.user} />
    </HydrationBoundary>
  );
}
