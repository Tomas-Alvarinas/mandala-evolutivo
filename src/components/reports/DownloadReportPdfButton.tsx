"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";

type DownloadReportPdfButtonProps = {
  endpoint: string;
  variant?: "primary" | "secondary";
  label?: string;
  fallbackFilename?: string;
};

export function DownloadReportPdfButton({
  endpoint,
  variant = "secondary",
  label = "Descargar PDF",
  fallbackFilename = "carta-natal.pdf",
}: DownloadReportPdfButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    if (isDownloading) {
      return;
    }

    setIsDownloading(true);
    setError(null);

    try {
      const response = await fetch(endpoint, {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
        signal: AbortSignal.timeout(55_000),
      });

      if (!response.ok) {
        setError(await readErrorMessage(response));
        return;
      }

      const blob = await response.blob();
      const filename =
        filenameFromDisposition(response.headers.get("Content-Disposition")) ??
        fallbackFilename;
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "TimeoutError") {
        setError("La generación del PDF tardó demasiado.");
        return;
      }

      setError("No se pudo generar el PDF. Intentá de nuevo.");
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div>
      <Button
        type="button"
        variant={variant}
        disabled={isDownloading}
        onClick={handleDownload}
      >
        {isDownloading ? "Generando PDF..." : label}
      </Button>
      {error ? (
        <Alert variant="danger" className="mt-3" role="alert" title={error} />
      ) : null}
    </div>
  );
}

async function readErrorMessage(response: Response) {
  try {
    const payload: unknown = await response.json();
    if (
      payload &&
      typeof payload === "object" &&
      "error" in payload &&
      typeof payload.error === "string" &&
      payload.error.trim()
    ) {
      return payload.error;
    }
  } catch {
    // Fall through to the generic message.
  }

  if (response.status === 401) {
    return "Tu sesión expiró. Volvé a iniciar sesión.";
  }

  return "No se pudo generar el PDF. Intentá de nuevo.";
}

function filenameFromDisposition(header: string | null) {
  if (!header) {
    return null;
  }

  const match = /filename="([^"]+)"/i.exec(header);
  return match?.[1] ?? null;
}
