import { NextResponse } from "next/server";
import { natalChartReportSchema } from "@/lib/ai/natal-chart/schema";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { getClientById } from "@/lib/clients/repository";
import { isPdfGenerationError } from "@/lib/pdf/errors";
import { toNatalChartProfessionalPdfFilename } from "@/lib/reports/natal-chart/professional-pdf/filename";
import { generateNatalChartProfessionalReportPdf } from "@/lib/reports/natal-chart/professional-pdf/generate";
import { getNatalChartReportById } from "@/lib/reports/natal-chart/repository";

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
  const [clientResult, reportResult] = await Promise.all([
    getClientById(clientId),
    getNatalChartReportById({ clientId, reportId }),
  ]);

  if (
    clientResult.status === "unauthorized" ||
    reportResult.status === "unauthorized"
  ) {
    return jsonError("No autorizado.", 401);
  }

  if (
    clientResult.status === "not_found" ||
    reportResult.status === "not_found"
  ) {
    return jsonError("No se encontró el informe profesional.", 404);
  }

  if (reportResult.status === "invalid") {
    return jsonError("El informe profesional no es válido.", 422);
  }

  if (
    clientResult.status === "not_configured" ||
    reportResult.status === "not_configured"
  ) {
    return jsonError("Falta configurar el acceso a los datos para generar el PDF.", 503);
  }

  if (clientResult.status !== "ok" || reportResult.status !== "ok") {
    return jsonError("No se pudo cargar el informe profesional.", 500);
  }

  const parsed = natalChartReportSchema.safeParse(reportResult.data.report);

  if (!parsed.success) {
    return jsonError("El informe profesional no es válido.", 422);
  }

  const clientName = `${clientResult.data.firstName} ${clientResult.data.lastName}`;

  try {
    const pdf = await generateNatalChartProfessionalReportPdf({
      report: parsed.data,
      clientName,
      technical: {
        paulaLensVersion: reportResult.data.paulaLensVersion,
        geminiModel: reportResult.data.geminiModel,
      },
    });
    const filename = toNatalChartProfessionalPdfFilename(clientName);

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
    console.error("[professional-report-pdf] Generation failed", {
      code: isPdfGenerationError(error) ? error.code : "unknown",
      stage: isPdfGenerationError(error) ? error.stage : undefined,
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
