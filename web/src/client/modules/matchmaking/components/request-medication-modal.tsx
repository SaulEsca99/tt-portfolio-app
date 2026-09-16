"use client";

import { Alert, AlertDescription } from "@/client/components/ui/alert";
import { Badge } from "@/client/components/ui/badge";
import { Button } from "@/client/components/ui/button";
import { Card } from "@/client/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/client/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/client/components/ui/select";
import { AlertTriangle, CheckCircle2, Loader2, Pill } from "lucide-react";
import { useState } from "react";
import { useRequestMedication } from "../features/request-medication/use-request-medication.hook";

interface RequestMedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicationId: number;
  medicationName: string;
  medicationDosage: string;
  isControlled: boolean;
}

type FlowStep = "form" | "success";

export function RequestMedicationModal({
  isOpen,
  onClose,
  medicationId,
  medicationName,
  medicationDosage,
  isControlled,
}: RequestMedicationModalProps) {
  const [step, setStep] = useState<FlowStep>("form");

  const form = useRequestMedication({
    medicationId,
    onSuccess: () => {
      setStep("success");
    },
  });

  const handleClose = () => {
    form.reset();
    setStep("form");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        {step === "form" ? (
          <>
            <DialogHeader>
              <DialogTitle>Solicitar {medicationName}</DialogTitle>
              <DialogDescription>Dosis: {medicationDosage}</DialogDescription>
            </DialogHeader>

            <form.AppForm>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  form.handleSubmit();
                }}
                className="space-y-4"
              >
                <Card className="p-4 bg-muted">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                      <Pill className="w-5 h-5 text-teal-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-pretty">
                          {medicationName}
                        </h4>
                        {isControlled && (
                          <Badge variant="destructive" className="text-xs">
                            Controlado
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {medicationDosage}
                      </p>
                    </div>
                  </div>
                </Card>

                {isControlled && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-pretty">
                      <strong>Medicamento Controlado:</strong> Este medicamento
                      requiere receta médica.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <form.AppField name="requesterName">
                    {(field) => (
                      <field.Input
                        label="Nombre completo"
                        placeholder="Tu nombre completo"
                        autoFocus
                      />
                    )}
                  </form.AppField>

                  <form.AppField name="requesterPhone">
                    {(field) => (
                      <field.Input
                        label="Teléfono de contacto"
                        type="tel"
                        placeholder="+52 123 456 7890"
                      />
                    )}
                  </form.AppField>

                  <form.AppField name="medicalSituation">
                    {(field) => (
                      <>
                        <field.Textarea
                          label="Situación médica"
                          placeholder="¿Por qué necesitas este medicamento? Explica tu situación médica (mínimo 20 caracteres)"
                          className="min-h-[100px] resize-none"
                        />
                        <div className="flex justify-end text-xs text-muted-foreground mt-1">
                          <span>{field.state.value?.length || 0}/500</span>
                        </div>
                      </>
                    )}
                  </form.AppField>

                  <form.AppField name="urgencyLevel">
                    {(field) => (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Nivel de urgencia
                        </label>
                        <Select
                          value={field.state.value}
                          onValueChange={(
                            value: "low" | "medium" | "high" | "critical"
                          ) => field.handleChange(value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el nivel de urgencia" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">
                              Baja - Tratamiento preventivo
                            </SelectItem>
                            <SelectItem value="medium">
                              Media - Tratamiento regular
                            </SelectItem>
                            <SelectItem value="high">
                              Alta - Necesidad inmediata
                            </SelectItem>
                            <SelectItem value="critical">
                              Crítica - Urgencia médica
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </form.AppField>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleClose}
                    disabled={form.state.isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <form.Subscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                    // eslint-disable-next-line react/no-children-prop
                    children={([canSubmit, isSubmitting]) => (
                      <Button
                        type="submit"
                        disabled={!canSubmit || isSubmitting}
                        className="bg-teal-600 hover:bg-teal-700"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          "Enviar Solicitud"
                        )}
                      </Button>
                    )}
                  />
                </DialogFooter>
              </form>
            </form.AppForm>
          </>
        ) : (
          <>
            <div className="text-center space-y-6 py-8">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">¡Solicitud enviada!</h3>
                <p className="text-muted-foreground text-balance max-w-sm mx-auto">
                  El donante ha recibido tu solicitud. Te notificaremos cuando
                  responda.
                </p>
              </div>
              <Button
                onClick={handleClose}
                className="w-full bg-teal-600 hover:bg-teal-700"
              >
                Entendido
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
