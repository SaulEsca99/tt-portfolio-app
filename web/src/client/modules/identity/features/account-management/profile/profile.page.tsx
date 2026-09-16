"use client";

import { SETTINGS_ROUTES } from "@/client/config/routes";
import { Gift, HandHeart, Heart, Sparkles } from "lucide-react";
import Link from "next/link";

export function ProfilePage() {
  return (
    <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center">
      <div className="max-w-lg w-full text-center space-y-8 px-4">
        {/* Illustration */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="h-32 w-32 rounded-full bg-linear-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Sparkles className="h-16 w-16 text-primary" />
            </div>
            <div className="absolute -top-2 -right-2 h-12 w-12 rounded-full bg-success/20 flex items-center justify-center">
              <Heart className="h-6 w-6 text-success" />
            </div>
          </div>
        </div>

        {/* Welcome Text */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-foreground text-balance">
            Bienvenido a la comunidad
          </h1>
          <p className="text-muted-foreground text-lg text-balance">
            Para empezar a conectar, necesitamos saber si estás aquí para donar
            o para recibir ayuda
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Link
            href={SETTINGS_ROUTES.profile.donor}
            className="flex-1 h-auto py-6 rounded-2xl bg-primary hover:bg-primary/90"
          >
            <div className="flex flex-col items-center gap-2">
              <Gift className="h-8 w-8" />
              <div className="text-left">
                <div className="font-semibold text-base">
                  Quiero ser Donante
                </div>
                <div className="text-xs opacity-90 font-normal">
                  Ayuda a quien lo necesita
                </div>
              </div>
            </div>
          </Link>

          <Link
            className="flex-1 h-auto py-6 rounded-2xl border-2 hover:bg-muted bg-transparent"
            href={SETTINGS_ROUTES.profile.recipient}
          >
            <div className="flex flex-col items-center gap-2">
              <HandHeart className="h-8 w-8" />
              <div className="text-left">
                <div className="font-semibold text-base">Soy Beneficiario</div>
                <div className="text-xs text-muted-foreground font-normal">
                  Recibe apoyo médico
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
