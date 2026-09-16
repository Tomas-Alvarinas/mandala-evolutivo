"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { deleteTransitAnalysisAction } from "@/lib/transits/actions";
import { formatIsoDateOnlyEs } from "@/lib/transits";

type DeleteTransitAnalysisControlProps = {
  clientId: string;
  analysisId: string;
  analysisDate: string;
};

export function DeleteTransitAnalysisControl({
  clientId,
  analysisId,
  analysisDate,
}: DeleteTransitAnalysisControlProps) {
  const router = useRouter();
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dateLabel = formatIsoDateOnlyEs(analysisDate) || analysisDate;

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
      if (event.key === "Escape" && !isDeleting) {
        setIsOpen(false);
        setError(null);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDeleting, isOpen]);

  function closeDialog() {
    if (isDeleting) {
      return;
    }

    setIsOpen(false);
    setError(null);
  }

  async function handleDelete() {
    if (isDeleting) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    const result = await deleteTransitAnalysisAction({
      clientId,
      analysisId,
    });

    if (!result.success) {
      setError(result.error);
      setIsDeleting(false);
      return;
    }

    router.push(`/clients/${clientId}/transits`);
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        className="text-sm tracking-wide text-danger/80 transition-colors hover:text-danger-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => {
          setError(null);
          setIsOpen(true);
        }}
      >
        Eliminar período
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <button
            type="button"
            className="absolute inset-0 bg-foreground/30"
            aria-label="Cerrar"
            disabled={isDeleting}
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
              Eliminar período
            </h2>
            <div id={descriptionId} className="mt-4 space-y-3">
              <p className="text-sm leading-relaxed text-foreground">
                Se eliminarán los tránsitos, aspectos, eclipses e informes de
                este período del {dateLabel}.
              </p>
              <p className="text-sm leading-relaxed text-muted">
                La Carta Natal no se modifica. No se puede deshacer.
              </p>
            </div>

            {error ? (
              <p className="mt-4 text-sm text-accent" role="alert">
                {error}
              </p>
            ) : null}

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="secondary"
                disabled={isDeleting}
                onClick={closeDialog}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="danger"
                disabled={isDeleting}
                onClick={handleDelete}
              >
                {isDeleting ? "Eliminando..." : "Eliminar definitivamente"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
