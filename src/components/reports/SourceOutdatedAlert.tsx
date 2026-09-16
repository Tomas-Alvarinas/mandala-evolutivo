import type { ReactNode } from "react";
import { Alert } from "@/components/ui/Alert";
import {
  SOURCE_OUTDATED_BODY,
  SOURCE_OUTDATED_MARK_READY,
  SOURCE_OUTDATED_TITLE,
} from "@/lib/reports";

type SourceOutdatedAlertProps = {
  className?: string;
  professionalReady?: boolean;
  children?: ReactNode;
};

export function SourceOutdatedAlert({
  className = "",
  professionalReady,
  children,
}: SourceOutdatedAlertProps) {
  return (
    <Alert
      variant="warning"
      className={className}
      role="alert"
      title={SOURCE_OUTDATED_TITLE}
      actions={children}
    >
      <p>{SOURCE_OUTDATED_BODY}</p>
      {professionalReady === false ? (
        <p className="mt-2">{SOURCE_OUTDATED_MARK_READY}</p>
      ) : null}
    </Alert>
  );
}
