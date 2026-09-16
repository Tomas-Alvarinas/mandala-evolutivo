import type { ReactNode } from "react";
import { NewClientFlowProvider } from "@/components/clients/NewClientFlowProvider";

export default function NewClientLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <NewClientFlowProvider>{children}</NewClientFlowProvider>;
}
