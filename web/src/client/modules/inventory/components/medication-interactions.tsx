"use client";

import { Button } from "@/client/components/ui/button";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { useMemo, useState } from "react";

interface MedicationInteractionsProps {
  medicationId: string | number;
}

export function MedicationInteractions({
  medicationId,
}: MedicationInteractionsProps) {
  const [liked, setLiked] = useState(false);

  const stats = useMemo(() => {
    const seed = Number(medicationId) || 0;
    return {
      likes: (seed % 20) + 5,
      comments: seed % 10,
    };
  }, [medicationId]);

  const [likesCount, setLikesCount] = useState(stats.likes);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    setLiked(!liked);
    setLikesCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 px-3 py-1.5 hover:bg-red-500/10 hover:text-red-500"
          onClick={handleLike}
        >
          <Heart
            className={`size-[18px] transition-all ${
              liked ? "fill-red-500 text-red-500" : ""
            }`}
          />
          <span className="text-sm">{likesCount}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="gap-2 px-3 py-1.5 hover:bg-blue-500/10 hover:text-blue-500"
        >
          <MessageCircle className="size-[18px]" />
          <span className="text-sm">{stats.comments}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="px-3 py-1.5 hover:bg-green-500/10 hover:text-green-500"
        >
          <Share2 className="size-[18px]" />
        </Button>
      </div>
    </div>
  );
}
