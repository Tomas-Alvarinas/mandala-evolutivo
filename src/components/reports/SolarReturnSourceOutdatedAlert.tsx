import type { ReactNode } from "react";
import { SourceOutdatedAlert } from "@/components/reports/SourceOutdatedAlert";

type SolarReturnSourceOutdatedAlertProps = {
  className?: string;
  professionalReady?: boolean;
  children?: ReactNode;
};

export function SolarReturnSourceOutdatedAlert({
  className = "",
  professionalReady,
  children,
}: SolarReturnSourceOutdatedAlertProps) {
  return (
    <SourceOutdatedAlert
      className={className}
      professionalReady={professionalReady}
    >
      {children}
    </SourceOutdatedAlert>
  );
}
