import type { ReactNode } from "react";
import { SourceOutdatedAlert } from "@/components/reports/SourceOutdatedAlert";

type TransitSourceOutdatedAlertProps = {
  className?: string;
  professionalReady?: boolean;
  children?: ReactNode;
};

export function TransitSourceOutdatedAlert({
  className = "",
  professionalReady,
  children,
}: TransitSourceOutdatedAlertProps) {
  return (
    <SourceOutdatedAlert
      className={className}
      professionalReady={professionalReady}
    >
      {children}
    </SourceOutdatedAlert>
  );
}
