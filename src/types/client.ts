export type ClientFormValues = {
  firstName: string;
  lastName: string;
  age: string;
  professionalNotes?: string;
};

export type ParsedClientInput = {
  firstName: string;
  lastName: string;
  age: number;
  professionalNotes: string | null;
};

export type PersistedClient = {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  professionalNotes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PersistedClientSummary = {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  createdAt: string;
};

export type ClientListItem = PersistedClientSummary & {
  updatedAt: string;
};

