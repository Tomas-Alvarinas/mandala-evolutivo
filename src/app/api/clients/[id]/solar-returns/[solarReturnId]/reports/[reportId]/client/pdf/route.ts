import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { getClientById } from "@/lib/clients/repository";
import { isPdfGenerationError } from "@/lib/pdf/errors";
import { solarReturnClientReportSchema } from "@/lib/reports/solar-returns/client-report";
import { toSolarReturnClientPdfFilename } from "@/lib/reports/solar-returns/client-report/pdf-filename";
import { generateSolarReturnClientReportPdf } from "@/lib/reports/solar-returns/client-report/pdf";
import { getSolarReturnClientReportByProfessionalReportId } from "@/lib/reports/solar-returns/client-report/repository";
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
  const [clientResult, solarReturnResult, clientReportResult] =
    await Promise.all([
      getClientById(clientId),
      getSolarReturnById(solarReturnId),
      getSolarReturnClientReportByProfessionalReportId({
        clientId,
        solarReturnId,
        professionalReportId: reportId,
      }),
    ]);

  if (
    clientResult.status === "unauthorized" ||
    solarReturnResult.status === "unauthorized" ||
    clientReportResult.status === "unauthorized"
  ) {
    return jsonError("No autorizado.", 401);
  }

  if (
    clientResult.status === "not_found" ||
    solarReturnResult.status === "not_found" ||
    clientReportResult.status === "not_found"
  ) {
    return jsonError("No se encontró la versión consultante.", 404);
  }

  if (clientReportResult.status === "invalid") {
    return jsonError("La versión consultante no es válida.", 422);
  }

  if (
    clientResult.status === "not_configured" ||
    solarReturnResult.status === "not_configured" ||
    clientReportResult.status === "not_configured"
  ) {
    return jsonError("Falta configurar el acceso a los datos para generar el PDF.", 503);
  }

  if (
    clientResult.status !== "ok" ||
    solarReturnResult.status !== "ok" ||
    clientReportResult.status !== "ok"
  ) {
    return jsonError("No se pudo cargar la versión consultante.", 500);
  }

  if (solarReturnResult.data.clientId !== clientResult.data.id) {
    return jsonError("No se encontró la versión consultante.", 404);
  }

  const parsed = solarReturnClientReportSchema.safeParse(
    clientReportResult.data.clientReport,
  );

  if (!parsed.success) {
    return jsonError("La versión consultante no es válida.", 422);
  }

  const clientName = `${clientResult.data.firstName} ${clientResult.data.lastName}`;

  try {
    const pdf = await generateSolarReturnClientReportPdf({
      report: parsed.data,
      clientName,
      periodStart: solarReturnResult.data.periodStart,
      periodEnd: solarReturnResult.data.periodEnd,
    });
    const filename = toSolarReturnClientPdfFilename(clientName);

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
    console.error("[solar-client-pdf] Generation failed", {
      kind: "solar_client",
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
