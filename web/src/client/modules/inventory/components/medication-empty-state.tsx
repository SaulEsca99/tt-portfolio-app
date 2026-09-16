import { Button } from "@/client/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/client/components/ui/empty";
import { PackageOpen, SearchX } from "lucide-react";

interface MedicationEmptyStateProps {
  onClearFilters?: () => void;
  isSearch?: boolean;
}

export function MedicationEmptyState({
  onClearFilters,
  isSearch,
}: MedicationEmptyStateProps) {
  return (
    <Empty className="py-12">
      <EmptyHeader>
        <EmptyMedia
          variant="icon"
          className="bg-muted/50 text-muted-foreground"
        >
          {isSearch ? <SearchX /> : <PackageOpen />}
        </EmptyMedia>
        <EmptyTitle>
          {isSearch
            ? "No encontramos lo que buscas"
            : "No hay medicamentos disponibles"}
        </EmptyTitle>
        <EmptyDescription>
          {isSearch
            ? "Intenta ajustando los filtros o buscando por sustancia activa."
            : "Parece que no hay donaciones activas en este momento. ¡Sé el primero en donar!"}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        {isSearch && onClearFilters ? (
          <Button onClick={onClearFilters}>Limpiar Filtros</Button>
        ) : (
          <Button variant="default">Publicar Donación</Button>
        )}
      </EmptyContent>
    </Empty>
  );
}
