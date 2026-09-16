import type {
  ClientFormValues,
  ParsedClientInput,
} from "@/types/client";

export type ParseClientResult =
  | { success: true; data: ParsedClientInput }
  | { success: false; error: string };

export function parseClientForm(
  values: ClientFormValues,
): ParseClientResult {
  const firstName = values.firstName.trim();
  const lastName = values.lastName.trim();
  const ageText = values.age.trim();
  const age = Number(ageText);
  const professionalNotes = values.professionalNotes?.trim() || null;

  if (
    !firstName ||
    !lastName ||
    ageText === "" ||
    !Number.isInteger(age) ||
    age < 0 ||
    age > 120
  ) {
    return {
      success: false,
      error: "Completá nombre, apellido y una edad válida para continuar.",
    };
  }

  return {
    success: true,
    data: {
      firstName,
      lastName,
      age,
      professionalNotes,
    },
  };
}
