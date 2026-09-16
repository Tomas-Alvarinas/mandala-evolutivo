import type { ReactNode } from "react";
import { containerMaxWidthClass, containerPaddingXClass } from "@/lib/ui/containers";
import { cx } from "@/lib/ui/cx";

type PageContainerProps = {
  children: ReactNode;
  className?: string;
  size?: keyof typeof containerMaxWidthClass;
};

export function PageContainer({
  children,
  className = "",
  size = "default",
}: PageContainerProps) {
  return (
    <main
      className={cx(
        "mx-auto w-full flex-1 py-10 sm:py-14",
        containerPaddingXClass,
        containerMaxWidthClass[size],
        className,
      )}
    >
      {children}
    </main>
  );
}
