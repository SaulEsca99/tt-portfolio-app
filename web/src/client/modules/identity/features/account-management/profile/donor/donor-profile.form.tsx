"use client";

import { Badge } from "@/client/components/ui/badge";
import { Button } from "@/client/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { SelectItem } from "@/client/components/ui/select";
import { Building2, FileText, MapPin, ShieldCheck, User } from "lucide-react";

import { toast } from "sonner";
import { DonorProfilePayload } from "./donor-profile.schema";
import { useDonorProfileForm } from "./use-donor-profile.form";

export function DonorProfileForm({
  initialData,
}: {
  initialData?: Partial<DonorProfilePayload>;
}) {
  const form = useDonorProfileForm({
    initialData,
    onSuccess: () => toast.success("Perfil guardado correctamente"),
  });

  // Determinar si el donante tiene licencia médica verificada
  const hasVerifiedLicense = initialData?.medicalLicense;

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
              <User className="h-5 w-5" />
              Información Básica
            </CardTitle>
            <CardDescription>Datos personales y de contacto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form.AppField name="fullName">
              {(field) => <field.Input label="Nombre Completo" />}
            </form.AppField>

            <div className="grid gap-4 md:grid-cols-2">
              <form.AppField name="phone">
                {(field) => (
                  <field.Input
                    label="Teléfono (Opcional)"
                    type="tel"
                    placeholder="+52 55 1234 5678"
                  />
                )}
              </form.AppField>

              <form.AppField name="donorType">
                {(field) => (
                  <field.Select label="Tipo de Donante">
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="pharmacy">Farmacia</SelectItem>
                    <SelectItem value="hospital">Hospital</SelectItem>
                    <SelectItem value="clinic">Clínica</SelectItem>
                    <SelectItem value="ngo">ONG</SelectItem>
                  </field.Select>
                )}
              </form.AppField>
            </div>

            <form.AppField name="bio">
              {(field) => (
                <field.Textarea
                  label="Bio (Opcional)"
                  placeholder="Cuéntanos sobre ti..."
                  rows={3}
                />
              )}
            </form.AppField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Datos de Organización
            </CardTitle>
            <CardDescription>
              Información opcional si representas una institución
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <form.AppField name="organization">
                {(field) => (
                  <field.Input
                    label="Organización (Opcional)"
                    placeholder="Hospital General, Farmacia..."
                  />
                )}
              </form.AppField>

              <form.AppField name="idDocument">
                {(field) => (
                  <field.Input
                    label="ID de Documento (Opcional)"
                    placeholder="RFC, Tax ID, etc."
                  />
                )}
              </form.AppField>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Ubicación
            </CardTitle>
            <CardDescription>
              Dirección completa para coordinación de donaciones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form.AppField name="address">
              {(field) => (
                <field.Input
                  label="Calle y Número (Opcional)"
                  placeholder="Av. Reforma 123"
                />
              )}
            </form.AppField>

            <div className="grid gap-4 md:grid-cols-3">
              <form.AppField name="city">
                {(field) => (
                  <field.Input
                    label="Ciudad (Opcional)"
                    placeholder="Ciudad de México"
                  />
                )}
              </form.AppField>

              <form.AppField name="state">
                {(field) => (
                  <field.Input label="Estado (Opcional)" placeholder="CDMX" />
                )}
              </form.AppField>

              <form.AppField name="postalCode">
                {(field) => (
                  <field.Input
                    label="Código Postal (Opcional)"
                    placeholder="01000"
                    maxLength={5}
                  />
                )}
              </form.AppField>
            </div>

            <form.AppField name="country">
              {(field) => <field.Input label="País" disabled />}
            </form.AppField>
          </CardContent>
        </Card>

        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Validación Médica
            </CardTitle>
            <CardDescription>
              Credenciales profesionales para verificación
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasVerifiedLicense && (
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                <div className="flex items-start gap-3">
                  <Badge className="bg-success text-white">
                    <ShieldCheck className="h-3 w-3 mr-1" />
                    Verificado
                  </Badge>
                  <p className="text-sm text-muted-foreground flex-1">
                    Tu licencia médica ha sido verificada por nuestro equipo.
                    Esto te permite crear donaciones sin restricciones.
                  </p>
                </div>
              </div>
            )}

            <form.AppField name="medicalLicense">
              {(field) => (
                <field.Input
                  label="Licencia Médica (Opcional)"
                  placeholder="Número de cédula profesional"
                />
              )}
            </form.AppField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documentación
            </CardTitle>
            <CardDescription>
              Documento de verificación (INE, Pasaporte, etc.)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form.AppField name="verificationDocument">
              {(field) => (
                <field.ImageUploader
                  label="Documento de Identificación (Opcional)"
                  folder="donor-docs"
                />
              )}
            </form.AppField>

            <form.AppField name="profilePicture">
              {(field) => (
                <field.ImageUploader
                  label="Foto de Perfil (Opcional)"
                  folder="donor-profile-pics"
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
              <Button type="submit" disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? "Guardando..." : "Guardar Perfil Donador"}
              </Button>
            </div>
          )}
        />
      </form>
    </form.AppForm>
  );
}
