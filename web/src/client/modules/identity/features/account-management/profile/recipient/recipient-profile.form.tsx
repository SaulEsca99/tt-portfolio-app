"use client";

import { Button } from "@/client/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { Label } from "@/client/components/ui/label";
import { SelectItem } from "@/client/components/ui/select";
import { Switch } from "@/client/components/ui/switch";
import { Briefcase, FileText, Heart, MapPin, User } from "lucide-react";

import { toast } from "sonner";
import { RecipientProfilePayload } from "./recipient-profile.schema";
import { useRecipientProfileForm } from "./use-recipient-profile.form";

export function RecipientProfileForm({
  initialData,
}: {
  initialData?: RecipientProfilePayload;
}) {
  const form = useRecipientProfileForm({
    initialData,
    onSuccess: () => toast.success("Perfil guardado correctamente"),
  });

  return (
    <form.AppForm>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-6"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" /> Datos Personales
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <form.AppField name="fullName">
              {(field) => <field.Input label="Nombre Completo" />}
            </form.AppField>

            <form.AppField name="phone">
              {(field) => (
                <field.Input label="Teléfono (Opcional)" type="tel" />
              )}
            </form.AppField>

            <form.AppField name="dateOfBirth">
              {(field) => <field.DatePicker label="Fecha de Nacimiento" />}
            </form.AppField>

            <form.AppField name="recipientType">
              {(field) => (
                <field.Select label="Tipo de Beneficiario">
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="family">Familia</SelectItem>
                  <SelectItem value="community_organization">
                    Organización Comunitaria
                  </SelectItem>
                </field.Select>
              )}
            </form.AppField>

            <form.AppField name="idDocument">
              {(field) => (
                <field.Input label="Documento Identidad (INE/Pasaporte)" />
              )}
            </form.AppField>

            <form.AppField name="socialSecurityNumber">
              {(field) => <field.Input label="Núm. Seguro Social (Opcional)" />}
            </form.AppField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" /> Ubicación de Entrega
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form.AppField name="address">
              {(field) => <field.Input label="Calle y Número" />}
            </form.AppField>
            <div className="grid gap-4 md:grid-cols-3">
              <form.AppField name="city">
                {(field) => <field.Input label="Ciudad" />}
              </form.AppField>
              <form.AppField name="state">
                {(field) => <field.Input label="Estado" />}
              </form.AppField>
              <form.AppField name="postalCode">
                {(field) => <field.Input label="C.P." maxLength={5} />}
              </form.AppField>
            </div>
            <form.AppField name="country">
              {(field) => <field.Input label="País" disabled />}
            </form.AppField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" /> Nivel Socioeconómico
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <form.AppField name="employmentStatus">
                {(field) => (
                  <field.Select label="Estatus de Empleo">
                    <SelectItem value="employed">Empleado</SelectItem>
                    <SelectItem value="unemployed">Desempleado</SelectItem>
                    <SelectItem value="self-employed">Independiente</SelectItem>
                    <SelectItem value="retired">Jubilado</SelectItem>
                    <SelectItem value="student">Estudiante</SelectItem>
                  </field.Select>
                )}
              </form.AppField>

              <form.AppField name="monthlyIncome">
                {(field) => (
                  <field.Select label="Rango de Ingresos">
                    <SelectItem value="none">Sin ingresos</SelectItem>
                    <SelectItem value="low">Bajo</SelectItem>
                    <SelectItem value="medium-low">Medio-Bajo</SelectItem>
                    <SelectItem value="medium">Medio</SelectItem>
                    <SelectItem value="medium-high">Medio-Alto</SelectItem>
                    <SelectItem value="high">Alto</SelectItem>
                  </field.Select>
                )}
              </form.AppField>
            </div>

            <form.AppField name="hasHealthInsurance">
              {(field) => (
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label htmlFor={field.name}>¿Tiene seguro médico?</Label>
                      <p className="text-sm text-muted-foreground">
                        Privado, IMSS, ISSSTE, etc.
                      </p>
                    </div>
                    <Switch
                      id={field.name}
                      checked={field.state.value}
                      onCheckedChange={field.handleChange}
                    />
                  </div>

                  {/* Input Condicional: Solo se muestra si tiene seguro */}
                  {field.state.value && (
                    <form.AppField name="insuranceProvider">
                      {(subField) => (
                        <subField.Input
                          label="Nombre de la Institución/Seguro"
                          placeholder="Ej: IMSS, GNP, MetLife"
                          className="animate-in fade-in slide-in-from-top-2"
                        />
                      )}
                    </form.AppField>
                  )}
                </div>
              )}
            </form.AppField>
          </CardContent>
        </Card>

        <Card className="border-warning/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-warning" /> Perfil Médico
            </CardTitle>
            <CardDescription>Información Confidencial</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form.AppField name="chronicConditions">
              {(field) => (
                <field.Textarea
                  label="Condiciones Crónicas (Opcional)"
                  placeholder="Diabetes, hipertensión..."
                />
              )}
            </form.AppField>

            <form.AppField name="allergies">
              {(field) => (
                <field.Textarea
                  label="Alergias (Opcional)"
                  placeholder="Penicilina..."
                />
              )}
            </form.AppField>

            <form.AppField name="currentMedications">
              {(field) => (
                <field.Textarea
                  label="Medicamentos Actuales (Opcional)"
                  placeholder="Lista de medicamentos que toma actualmente..."
                />
              )}
            </form.AppField>

            <form.AppField name="disabilities">
              {(field) => (
                <field.Textarea
                  label="Discapacidades (Opcional)"
                  placeholder="Describa si aplica..."
                />
              )}
            </form.AppField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" /> Documentación
            </CardTitle>
            <CardDescription>
              Sube tu comprobante de ingresos e identificación oficial
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form.AppField name="economicProof">
              {(field) => (
                <field.ImageUploader
                  label="Prueba Económica (Opcional)"
                  folder="recipient-docs"
                />
              )}
            </form.AppField>

            <form.AppField name="verificationDocument">
              {(field) => (
                <field.ImageUploader
                  label="Identificación Oficial (Opcional)"
                  folder="recipient-docs"
                />
              )}
            </form.AppField>
          </CardContent>
        </Card>

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          // eslint-disable-next-line react/no-children-prop
          children={([canSubmit, isSubmitting]) => (
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
              <Button type="submit" disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? "Guardando..." : "Guardar Perfil Beneficiario"}
              </Button>
            </div>
          )}
        />
      </form>
    </form.AppForm>
  );
}
