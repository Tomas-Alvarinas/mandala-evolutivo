import { redirect } from "next/navigation";
import { SupabaseSetupNotice } from "@/components/clients/SupabaseSetupNotice";
import { HomePendingWork } from "@/components/home/HomePendingWork";
import { HomeRecentClients } from "@/components/home/HomeRecentClients";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { getRecentClients } from "@/lib/clients/repository";
import { APP_NAME } from "@/lib/constants";
import { HOME_PENDING_WORK_LIMIT, HOME_RECENT_CLIENTS_LIMIT } from "@/lib/home/constants";
import {
  mergePendingWork,
  type PendingWorkItem,
} from "@/lib/home/pending-work";
import {
  getPendingNatalChartWorkHref,
  getPendingSolarReturnWorkHref,
  getPendingTransitAnalysisWorkHref,
} from "@/lib/reports";
import { getPendingNatalChartWork } from "@/lib/reports/natal-chart/repository";
import { getPendingSolarReturnWork } from "@/lib/reports/solar-returns/repository";
import { getPendingTransitAnalysisWork } from "@/lib/reports/transits/repository";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [
    pendingNatalResult,
    pendingTransitResult,
    pendingSolarResult,
    recentResult,
  ] = await Promise.all([
    getPendingNatalChartWork(),
    getPendingTransitAnalysisWork(),
    getPendingSolarReturnWork(),
    getRecentClients(HOME_RECENT_CLIENTS_LIMIT),
  ]);

  if (
    pendingNatalResult.status === "unauthorized" ||
    pendingTransitResult.status === "unauthorized" ||
    pendingSolarResult.status === "unauthorized" ||
    recentResult.status === "unauthorized"
  ) {
    redirect("/login");
  }

  if (
    pendingNatalResult.status === "not_configured" ||
    pendingTransitResult.status === "not_configured" ||
    pendingSolarResult.status === "not_configured" ||
    recentResult.status === "not_configured"
  ) {
    return (
      <PageContainer size="wide">
        <HomeGreeting />
        <div className="mt-10">
          <SupabaseSetupNotice />
        </div>
      </PageContainer>
    );
  }

  const natalItems: PendingWorkItem[] =
    pendingNatalResult.status === "ok"
      ? pendingNatalResult.data.items.map((item) => ({
          key: `natal:${item.reportId}`,
          module: "natal",
          clientId: item.clientId,
          clientFirstName: item.clientFirstName,
          clientLastName: item.clientLastName,
          status: item.status,
          kind: item.kind,
          updatedAt: item.updatedAt,
          href: getPendingNatalChartWorkHref({
            clientId: item.clientId,
            reportId: item.reportId,
          }),
        }))
      : [];
  const transitItems: PendingWorkItem[] =
    pendingTransitResult.status === "ok"
      ? pendingTransitResult.data.items.map((item) => ({
          key: `transits:${item.reportId}`,
          module: "transits",
          clientId: item.clientId,
          clientFirstName: item.clientFirstName,
          clientLastName: item.clientLastName,
          status: item.status,
          kind: item.kind,
          updatedAt: item.updatedAt,
          href: getPendingTransitAnalysisWorkHref({
            clientId: item.clientId,
            transitAnalysisId: item.transitAnalysisId,
            reportId: item.reportId,
          }),
          contextLabel: item.contextLabel,
        }))
      : [];
  const solarItems: PendingWorkItem[] =
    pendingSolarResult.status === "ok"
      ? pendingSolarResult.data.items.map((item) => ({
          key: `solar:${item.reportId}`,
          module: "solar",
          clientId: item.clientId,
          clientFirstName: item.clientFirstName,
          clientLastName: item.clientLastName,
          status: item.status,
          kind: item.kind,
          updatedAt: item.updatedAt,
          href: getPendingSolarReturnWorkHref({
            clientId: item.clientId,
            solarReturnId: item.solarReturnId,
            reportId: item.reportId,
          }),
          contextLabel: item.contextLabel,
        }))
      : [];
  const merged = mergePendingWork(
    natalItems,
    transitItems,
    solarItems,
    HOME_PENDING_WORK_LIMIT,
    {
      natalHasMore:
        pendingNatalResult.status === "ok"
          ? pendingNatalResult.data.hasMore
          : false,
      transitHasMore:
        pendingTransitResult.status === "ok"
          ? pendingTransitResult.data.hasMore
          : false,
      solarHasMore:
        pendingSolarResult.status === "ok"
          ? pendingSolarResult.data.hasMore
          : false,
    },
  );
  const pendingError =
    pendingNatalResult.status === "error" ||
    pendingTransitResult.status === "error" ||
    pendingSolarResult.status === "error";

  const recentClients =
    recentResult.status === "ok" ? recentResult.data.clients : [];
  const recentHasMore =
    recentResult.status === "ok" ? recentResult.data.hasMore : false;
  const recentError = recentResult.status === "error";

  const emptyAccount =
    !pendingError &&
    !recentError &&
    merged.items.length === 0 &&
    recentClients.length === 0;

  return (
    <PageContainer size="wide">
      <HomeGreeting />

      {emptyAccount ? (
        <div className="mt-10">
          <EmptyState
            title="Todavía no hay consultantes."
            description="Creá el primer consultante para comenzar a trabajar con su Carta Natal."
            action={
              <Button href="/clients/new" className="w-full sm:w-auto">
                Nuevo consultante
              </Button>
            }
          />
        </div>
      ) : (
        <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)] lg:items-start lg:gap-16">
          <HomePendingWork
            items={merged.items}
            hasMore={merged.hasMore}
            error={pendingError}
          />
          <HomeRecentClients
            clients={recentClients}
            hasMore={recentHasMore}
            error={recentError}
          />
        </div>
      )}
    </PageContainer>
  );
}

function HomeGreeting() {
  return (
    <PageHeader
      title={APP_NAME}
      description="Herramienta profesional para organizar consultantes y trabajar sus análisis evolutivos."
      actions={
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button href="/clients/new" className="w-full sm:w-auto">
            Nuevo consultante
          </Button>
          <Button
            href="/clients"
            variant="secondary"
            className="w-full sm:w-auto"
          >
            Ver consultantes
          </Button>
        </div>
      }
    />
  );
}
