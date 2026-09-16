import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Card variant="subtle" padding="comfortable">
      <p className="text-base font-medium text-foreground">{title}</p>
      {description ? (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-8">{action}</div> : null}
    </Card>
  );
}
