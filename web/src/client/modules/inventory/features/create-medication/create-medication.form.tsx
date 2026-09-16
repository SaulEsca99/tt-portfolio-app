"use client";

import { Button } from "@/client/components/ui/button";
import { Checkbox } from "@/client/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel } from "@/client/components/ui/field";
import { Calendar, MapPin } from "lucide-react";
import { useCreateMedication } from "./use-create-medication.hook";

export function CreateMedicationForm({
  donorId,
  onSuccess,
}: {
  donorId: string;
  onSuccess?: () => void;
}) {
  const form = useCreateMedication({ donorId, onSuccess });

  return (
    <form.AppForm>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="w-full bg-white"
      >
        <div className="overflow-y-auto max-h-[70vh]">
          <div className="p-4 border-b">
            <form.AppField name="photoUrl">
              {(field) => <field.ImageUploader label="Agregar foto" />}
            </form.AppField>
          </div>

          <div className="p-4 space-y-4">
            <FieldGroup>
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  Información del medicamento
                </h3>

                <form.AppField name="activeSubstance">
                  {(field) => (
                    <field.Input
                      label="Sustancia Activa"
                      placeholder="ej. Paracetamol"
                      autoFocus
                    />
                  )}
                </form.AppField>

                <div className="grid grid-cols-2 gap-3">
                  <form.AppField name="dosage">
                    {(field) => (
                      <field.Input label="Gramaje" placeholder="ej. 500mg" />
                    )}
                  </form.AppField>

                  <form.AppField name="quantity">
                    {(field) => (
                      <field.Input label="Cantidad" type="number" min={1} />
                    )}
                  </form.AppField>
                </div>

                <form.AppField name="presentation">
                  {(field) => (
                    <field.Input
                      label="Presentación"
                      placeholder="ej. Caja con 10 tabletas"
                    />
                  )}
                </form.AppField>

                <form.AppField name="brand">
                  {(field) => (
                    <field.Input
                      label="Marca (Opcional)"
                      placeholder="ej. Tempra"
                    />
                  )}
                </form.AppField>

                <form.AppField name="isControlled">
                  {(field) => (
                    <Field
                      orientation="horizontal"
                      className="items-center gap-2 border p-3 rounded-lg bg-amber-50"
                    >
                      <Checkbox
                        id={field.name}
                        checked={field.state.value}
                        onCheckedChange={(checked) =>
                          field.handleChange(!!checked)
                        }
                      />
                      <FieldLabel
                        htmlFor={field.name}
                        className="cursor-pointer text-sm font-medium"
                      >
                        Medicamento Controlado
                      </FieldLabel>
                    </Field>
                  )}
                </form.AppField>
              </div>

              <div className="pt-4 mt-4 border-t space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Caducidad y Lote
                </h3>

                <form.AppField name="expiryDate">
                  {(field) => <field.DatePicker label="Fecha de Caducidad" />}
                </form.AppField>

                <div className="grid grid-cols-2 gap-3">
                  <form.AppField name="lotNumber">
                    {(field) => (
                      <field.Input
                        label="Número de Lote"
                        placeholder="Ver empaque"
                      />
                    )}
                  </form.AppField>
                  <form.AppField name="laboratory">
                    {(field) => (
                      <field.Input label="Laboratorio" placeholder="Opcional" />
                    )}
                  </form.AppField>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Ubicación de Entrega
                </h3>

                <form.AppField name="postalCode">
                  {(field) => (
                    <field.Input
                      label="Código Postal"
                      maxLength={5}
                      placeholder="00000"
                      inputMode="numeric"
                    />
                  )}
                </form.AppField>

                <form.AppField name="preferredSchedule">
                  {(field) => (
                    <field.Input
                      label="Horario Preferido"
                      placeholder="Ej: Lun-Vie 9am a 6pm"
                    />
                  )}
                </form.AppField>

                <form.AppField name="location">
                  {(field) => (
                    <field.Input
                      label="Punto de Entrega"
                      placeholder="ej. Estación de Metro..."
                    />
                  )}
                </form.AppField>

                <form.AppField name="description">
                  {(field) => (
                    <field.Textarea // Cambiado a Textarea si lo tienes, sino Input está bien
                      label="Notas Adicionales"
                      placeholder="Detalles de entrega..."
                    />
                  )}
                </form.AppField>
              </div>
            </FieldGroup>
          </div>

          <div className="p-4 space-y-4">
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              // eslint-disable-next-line react/no-children-prop
              children={([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  size="lg"
                  className="w-full"
                >
                  {isSubmitting ? "Publicando..." : "Publicar Medicamento"}
                </Button>
              )}
            />
          </div>
        </div>
      </form>
    </form.AppForm>
  );
}
