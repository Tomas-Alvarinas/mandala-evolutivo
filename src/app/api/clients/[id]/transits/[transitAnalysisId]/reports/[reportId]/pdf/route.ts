import { NextResponse } from "next/server";
import { transitAnalysisReportSchema } from "@/lib/ai/transits/schema";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { getClientById } from "@/lib/clients/repository";
import { isPdfGenerationError } from "@/lib/pdf/errors";
import { toTransitAnalysisProfessionalPdfFilename } from "@/lib/reports/transits/professional-pdf/filename";
import { generateTransitAnalysisProfessionalReportPdf } from "@/lib/reports/transits/professional-pdf/generate";
import { getTransitAnalysisReportById } from "@/lib/reports/transits/repository";
import { getTransitAnalysisById } from "@/lib/transits/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type PdfRouteContext = {
  params: Promise<{ id: string; transitAnalysisId: string; reportId: string }>;
};

export async function GET(_request: Request, context: PdfRouteContext) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return jsonError("No autorizado.", 401);
  }

  const { id: clientId, transitAnalysisId, reportId } = await context.params;
  const [clientResult, analysisResult, reportResult] = await Promise.all([
    getClientById(clientId),
    getTransitAnalysisById(transitAnalysisId),
    getTransitAnalysisReportById({
      clientId,
      transitAnalysisId,
      reportId,
    }),
  ]);

  if (
    clientResult.status === "unauthorized" ||
    analysisResult.status === "unauthorized" ||
    reportResult.status === "unauthorized"
  ) {
    return jsonError("No autorizado.", 401);
  }

  if (
    clientResult.status === "not_found" ||
    analysisResult.status === "not_found" ||
    reportResult.status === "not_found"
  ) {
    return jsonError("No se encontró el informe profesional.", 404);
  }

  if (reportResult.status === "invalid") {
    return jsonError("El informe profesional no es válido.", 422);
  }

  if (
    clientResult.status === "not_configured" ||
    analysisResult.status === "not_configured" ||
    reportResult.status === "not_configured"
  ) {
    return jsonError("Falta configurar el acceso a los datos para generar el PDF.", 503);
  }

  if (
    clientResult.status !== "ok" ||
    analysisResult.status !== "ok" ||
    reportResult.status !== "ok"
  ) {
    return jsonError("No se pudo cargar el informe profesional.", 500);
  }

  if (analysisResult.data.clientId !== clientResult.data.id) {
    return jsonError("No se encontró el informe profesional.", 404);
  }

  const parsed = transitAnalysisReportSchema.safeParse(reportResult.data.report);

  if (!parsed.success) {
    return jsonError("El informe profesional no es válido.", 422);
  }

  const clientName = `${clientResult.data.firstName} ${clientResult.data.lastName}`;

  try {
    const pdf = await generateTransitAnalysisProfessionalReportPdf({
      report: parsed.data,
      clientName,
    });
    const filename = toTransitAnalysisProfessionalPdfFilename(clientName);

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
    console.error("[transit-professional-pdf] Generation failed", {
      kind: "transit_professional",
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
