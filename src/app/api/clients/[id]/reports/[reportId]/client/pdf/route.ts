import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { natalChartClientReportSchema } from "@/lib/reports/natal-chart/client-report";
import { toNatalChartClientPdfFilename } from "@/lib/reports/natal-chart/client-report/pdf-filename";
import {
  isPdfGenerationError,
  generateNatalChartClientReportPdf,
} from "@/lib/reports/natal-chart/client-report/pdf";
import { getNatalChartClientReport } from "@/lib/reports/natal-chart/client-report/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type PdfRouteContext = {
  params: Promise<{ id: string; reportId: string }>;
};

export async function GET(_request: Request, context: PdfRouteContext) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return jsonError("No autorizado.", 401);
  }

  const { id: clientId, reportId } = await context.params;
  const stored = await getNatalChartClientReport({
    clientId,
    natalChartReportId: reportId,
  });

  if (stored.status === "unauthorized") {
    return jsonError("No autorizado.", 401);
  }

  if (stored.status === "not_found") {
    return jsonError("No se encontró la versión consultante.", 404);
  }

  if (stored.status === "invalid") {
    return jsonError("La versión consultante no es válida.", 422);
  }

  if (stored.status === "not_configured") {
    return jsonError("Falta configurar el acceso a los datos para generar el PDF.", 503);
  }

  if (stored.status !== "ok") {
    return jsonError("No se pudo cargar la versión consultante.", 500);
  }

  const parsed = natalChartClientReportSchema.safeParse(stored.data.clientReport);

  if (!parsed.success) {
    return jsonError("La versión consultante no es válida.", 422);
  }

  try {
    const pdf = await generateNatalChartClientReportPdf({
      report: parsed.data,
    });
    const filename = toNatalChartClientPdfFilename(parsed.data.cover.clientName);

    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
        "Content-Length": String(pdf.byteLength),
      },
    });
  } catch (error) {
    console.error("[client-report-pdf] Generation failed", {
      code: isPdfGenerationError(error) ? error.code : "unknown",
    });

    if (isPdfGenerationError(error)) {
      if (error.code === "browser_unavailable") {
        return jsonError(
          "No hay un navegador disponible para generar el PDF.",
          503,
        );
      }

      if (error.code === "timeout") {
        return jsonError("La generación del PDF tardó demasiado.", 504);
      }
    }

    return jsonError("No se pudo generar el PDF.", 500);
  }
}

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}
