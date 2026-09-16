"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import {
  buildClientListPath,
  CLIENT_SEARCH_DEBOUNCE_MS,
  normalizeClientSearchQuery,
  parseClientListSort,
  type ClientListSort,
} from "@/lib/clients/list-query";
import { controlClassName } from "@/lib/ui/control-classes";

const SORT_OPTIONS: ReadonlyArray<{ id: ClientListSort; label: string }> = [
  { id: "recent", label: "Más recientes" },
  { id: "name-asc", label: "Nombre A–Z" },
  { id: "name-desc", label: "Nombre Z–A" },
];

type ClientsDirectoryControlsProps = {
  query: string;
  sort: ClientListSort;
};

export function ClientsDirectoryControls({
  query: urlQuery,
  sort,
}: ClientsDirectoryControlsProps) {
  const router = useRouter();
  const [query, setQuery] = useState(urlQuery);
  const lastSubmittedQuery = useRef(urlQuery);

  const navigate = useCallback(
    (nextQuery: string, nextSort: ClientListSort) => {
      const normalized = normalizeClientSearchQuery(nextQuery);
      lastSubmittedQuery.current = normalized;
      router.replace(buildClientListPath({ q: normalized, sort: nextSort }), {
        scroll: false,
      });
    },
    [router],
  );

  useEffect(() => {
    if (urlQuery !== lastSubmittedQuery.current) {
      lastSubmittedQuery.current = urlQuery;
      setQuery(urlQuery);
    }
  }, [urlQuery]);

  useEffect(() => {
    const nextQuery = normalizeClientSearchQuery(query);

    if (nextQuery === lastSubmittedQuery.current) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      navigate(nextQuery, sort);
    }, CLIENT_SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [navigate, query, sort]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate(query, sort);
  }

  function handleClear() {
    setQuery("");
    navigate("", sort);
  }

  const canClear = normalizeClientSearchQuery(query).length > 0;

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 sm:flex-row sm:items-end"
    >
      <div className="min-w-0 flex-1">
        <Field id="client-search" label="Buscar">
          <div className="flex gap-2">
            <input
              id="client-search"
              type="search"
              name="q"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              autoComplete="off"
              spellCheck={false}
              placeholder="Nombre o apellido"
              className={controlClassName}
            />
            {canClear ? (
              <Button
                type="button"
                variant="secondary"
                className="shrink-0 px-3"
                onClick={handleClear}
              >
                Limpiar
              </Button>
            ) : null}
          </div>
        </Field>
      </div>
      <div className="sm:w-52">
        <Field id="client-sort" label="Orden">
          <select
            id="client-sort"
            name="sort"
            value={sort}
            onChange={(event) => {
              navigate(query, parseClientListSort(event.target.value));
            }}
            className={controlClassName}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
      </div>
    </form>
  );
}
