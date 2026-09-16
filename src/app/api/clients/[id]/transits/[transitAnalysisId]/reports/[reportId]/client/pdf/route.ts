import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { getClientById } from "@/lib/clients/repository";
import { isPdfGenerationError } from "@/lib/pdf/errors";
import { transitClientReportSchema } from "@/lib/reports/transits/client-report";
import { toTransitClientPdfFilename } from "@/lib/reports/transits/client-report/pdf-filename";
import { generateTransitClientReportPdf } from "@/lib/reports/transits/client-report/pdf";
import { getTransitClientReportByProfessionalReportId } from "@/lib/reports/transits/client-report/repository";
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
  const [clientResult, analysisResult, clientReportResult] = await Promise.all([
    getClientById(clientId),
    getTransitAnalysisById(transitAnalysisId),
    getTransitClientReportByProfessionalReportId({
      clientId,
      transitAnalysisId,
      professionalReportId: reportId,
    }),
  ]);

  if (
    clientResult.status === "unauthorized" ||
    analysisResult.status === "unauthorized" ||
    clientReportResult.status === "unauthorized"
  ) {
    return jsonError("No autorizado.", 401);
  }

  if (
    clientResult.status === "not_found" ||
    analysisResult.status === "not_found" ||
    clientReportResult.status === "not_found"
  ) {
    return jsonError("No se encontró la versión consultante.", 404);
  }

  if (clientReportResult.status === "invalid") {
    return jsonError("La versión consultante no es válida.", 422);
  }

  if (
    clientResult.status === "not_configured" ||
    analysisResult.status === "not_configured" ||
    clientReportResult.status === "not_configured"
  ) {
    return jsonError("Falta configurar el acceso a los datos para generar el PDF.", 503);
  }

  if (
    clientResult.status !== "ok" ||
    analysisResult.status !== "ok" ||
    clientReportResult.status !== "ok"
  ) {
    return jsonError("No se pudo cargar la versión consultante.", 500);
  }

  if (analysisResult.data.clientId !== clientResult.data.id) {
    return jsonError("No se encontró la versión consultante.", 404);
  }

  const parsed = transitClientReportSchema.safeParse(
    clientReportResult.data.clientReport,
  );

  if (!parsed.success) {
    return jsonError("La versión consultante no es válida.", 422);
  }

  const clientName = `${clientResult.data.firstName} ${clientResult.data.lastName}`;

  try {
    const pdf = await generateTransitClientReportPdf({
      report: parsed.data,
      clientName,
      analysisDate: analysisResult.data.analysisDate,
    });
    const filename = toTransitClientPdfFilename(clientName);

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
    console.error("[transit-client-pdf] Generation failed", {
      kind: "transit_client",
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
