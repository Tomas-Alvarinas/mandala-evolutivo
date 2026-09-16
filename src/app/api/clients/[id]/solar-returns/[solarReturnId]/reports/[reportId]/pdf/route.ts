import { NextResponse } from "next/server";
import { solarReturnReportSchema } from "@/lib/ai/solar-returns/schema";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { getClientById } from "@/lib/clients/repository";
import { isPdfGenerationError } from "@/lib/pdf/errors";
import { toSolarReturnProfessionalPdfFilename } from "@/lib/reports/solar-returns/professional-pdf/filename";
import { generateSolarReturnProfessionalReportPdf } from "@/lib/reports/solar-returns/professional-pdf/generate";
import { getSolarReturnReportById } from "@/lib/reports/solar-returns/repository";
import { getSolarReturnById } from "@/lib/solar-returns/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type PdfRouteContext = {
  params: Promise<{ id: string; solarReturnId: string; reportId: string }>;
};

export async function GET(_request: Request, context: PdfRouteContext) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return jsonError("No autorizado.", 401);
  }

  const { id: clientId, solarReturnId, reportId } = await context.params;
  const [clientResult, solarReturnResult, reportResult] = await Promise.all([
    getClientById(clientId),
    getSolarReturnById(solarReturnId),
    getSolarReturnReportById({
      clientId,
      solarReturnId,
      reportId,
    }),
  ]);

  if (
    clientResult.status === "unauthorized" ||
    solarReturnResult.status === "unauthorized" ||
    reportResult.status === "unauthorized"
  ) {
    return jsonError("No autorizado.", 401);
  }

  if (
    clientResult.status === "not_found" ||
    solarReturnResult.status === "not_found" ||
    reportResult.status === "not_found"
  ) {
    return jsonError("No se encontró el informe profesional.", 404);
  }

  if (reportResult.status === "invalid") {
    return jsonError("El informe profesional no es válido.", 422);
  }

  if (
    clientResult.status === "not_configured" ||
    solarReturnResult.status === "not_configured" ||
    reportResult.status === "not_configured"
  ) {
    return jsonError("Falta configurar el acceso a los datos para generar el PDF.", 503);
  }

  if (
    clientResult.status !== "ok" ||
    solarReturnResult.status !== "ok" ||
    reportResult.status !== "ok"
  ) {
    return jsonError("No se pudo cargar el informe profesional.", 500);
  }

  if (solarReturnResult.data.clientId !== clientResult.data.id) {
    return jsonError("No se encontró el informe profesional.", 404);
  }

  const parsed = solarReturnReportSchema.safeParse(reportResult.data.report);

  if (!parsed.success) {
    return jsonError("El informe profesional no es válido.", 422);
  }

  const clientName = `${clientResult.data.firstName} ${clientResult.data.lastName}`;

  try {
    const pdf = await generateSolarReturnProfessionalReportPdf({
      report: parsed.data,
      clientName,
    });
    const filename = toSolarReturnProfessionalPdfFilename(clientName);

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
    console.error("[solar-professional-pdf] Generation failed", {
      kind: "solar_professional",
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
