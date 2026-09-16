"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import {
  createEmptyNatalChartDraft,
  type NatalChartDraft,
} from "@/lib/clients/natal-chart-form";
import type { ClientFormValues } from "@/types/client";

type NewClientFlowContextValue = {
  client: ClientFormValues | null;
  natalChart: NatalChartDraft;
  setClient: (client: ClientFormValues) => void;
  setNatalChart: Dispatch<SetStateAction<NatalChartDraft>>;
};

const NewClientFlowContext = createContext<NewClientFlowContextValue | null>(
  null,
);

export function NewClientFlowProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<ClientFormValues | null>(null);
  const [natalChart, setNatalChart] = useState<NatalChartDraft>(
    createEmptyNatalChartDraft,
  );

  const value = useMemo(
    () => ({
      client,
      natalChart,
      setClient,
      setNatalChart,
    }),
    [client, natalChart],
  );

  return (
    <NewClientFlowContext.Provider value={value}>
      {children}
    </NewClientFlowContext.Provider>
  );
}

export function useNewClientFlow() {
  const context = useContext(NewClientFlowContext);

  if (!context) {
    throw new Error(
      "useNewClientFlow must be used within NewClientFlowProvider",
    );
  }

  return context;
}
