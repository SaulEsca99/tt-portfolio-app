"use client";

import { Card } from "@/client/components/ui/card";
import { UserAvatar } from "@/client/modules/identity/components/user-avatar";
import { UserProfile } from "@/client/types/user";
import { ImageIcon, MapPin } from "lucide-react";
import { useCreateMedicationModal } from "../../inventory/features/create-medication/use-create-medication.modal";

export function FeedInputTrigger({ user }: { user?: UserProfile }) {
  const createModal = useCreateMedicationModal();

  return (
    <Card className="p-4 mb-6 shadow-sm">
      <div className="flex gap-3">
        <UserAvatar name={user?.name} image={user?.image} />

        <div onClick={createModal.onOpen} className="flex-1 cursor-pointer">
          <div className="w-full h-10 px-3 py-2 rounded-full bg-muted/50 text-muted-foreground text-sm flex items-center hover:bg-muted transition-colors">
            ¿Qué medicamento deseas donar hoy, {user?.name?.split(" ")[0]}?
          </div>
        </div>
      </div>

      <div className="flex pt-3 mt-3 border-t justify-between px-4">
        <button
          onClick={createModal.onOpen}
          className="flex items-center gap-2 text-sm text-gray-500 hover:bg-gray-100 px-3 py-1 rounded-md transition"
        >
          <ImageIcon className="w-5 h-5 text-green-500" />
          <span>Foto</span>
        </button>

        <button
          onClick={createModal.onOpen}
          className="flex items-center gap-2 text-sm text-gray-500 hover:bg-gray-100 px-3 py-1 rounded-md transition"
        >
          <MapPin className="w-5 h-5 text-red-500" />
          <span>Ubicación</span>
        </button>
      </div>
    </Card>
  );
}
