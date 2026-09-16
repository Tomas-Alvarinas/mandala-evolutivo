"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { refreshSolarReturnClientReportFromProfessional } from "@/lib/reports/solar-returns/client-report/actions";

type RefreshSolarReturnClientReportFromProfessionalControlProps = {
  clientId: string;
  solarReturnId: string;
  professionalReportId: string;
};

export function RefreshSolarReturnClientReportFromProfessionalControl({
  clientId,
  solarReturnId,
  professionalReportId,
}: RefreshSolarReturnClientReportFromProfessionalControlProps) {
  const router = useRouter();
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    dialogRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isRefreshing) {
        setIsOpen(false);
        setError(null);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isRefreshing]);

  function closeDialog() {
    if (isRefreshing) {
      return;
    }

    setIsOpen(false);
    setError(null);
  }

  async function handleRefresh() {
    if (isRefreshing) {
      return;
    }

    setIsRefreshing(true);
    setError(null);

    const result = await refreshSolarReturnClientReportFromProfessional({
      clientId,
      solarReturnId,
      professionalReportId,
    });

    if (!result.success) {
      setError(result.error);
      setIsRefreshing(false);
      return;
    }

    setIsOpen(false);
    setIsRefreshing(false);
    router.refresh();
  }

  return (
    <div>
      <Button
        type="button"
        variant="secondary"
        className="w-full whitespace-normal text-center sm:w-auto"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => {
          setError(null);
          setIsOpen(true);
        }}
      >
        Actualizar desde informe profesional
      </Button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <button
            type="button"
            className="absolute inset-0 bg-foreground/30"
            aria-label="Cerrar"
            disabled={isRefreshing}
            onClick={closeDialog}
          />
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            tabIndex={-1}
            className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card px-6 py-6 shadow-sm outline-none sm:px-8"
          >
            <h2
              id={titleId}
              className="font-serif text-2xl tracking-tight text-foreground"
            >
              ¿Actualizar la versión consultante?
            </h2>
            <p
              id={descriptionId}
              className="mt-4 text-sm leading-relaxed text-foreground"
            >
              Esta acción reemplazará el contenido actual de la versión consultante por el informe profesional actualizado. Los cambios manuales realizados en la versión consultante se perderán.
            </p>

            {error ? (
              <p className="mt-4 text-sm text-accent" role="alert">
                {error}
              </p>
            ) : null}

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="secondary"
                disabled={isRefreshing}
                onClick={closeDialog}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                disabled={isRefreshing}
                onClick={handleRefresh}
              >
                {isRefreshing ? "Actualizando..." : "Actualizar versión"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
