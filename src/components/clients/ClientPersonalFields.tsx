"use client";

import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

type ClientPersonalFieldsProps = {
  firstName: string;
  lastName: string;
  age: string;
  professionalNotes: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onAgeChange: (value: string) => void;
  onProfessionalNotesChange: (value: string) => void;
};

export function ClientPersonalFields({
  firstName,
  lastName,
  age,
  professionalNotes,
  onFirstNameChange,
  onLastNameChange,
  onAgeChange,
  onProfessionalNotesChange,
}: ClientPersonalFieldsProps) {
  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          id="firstName"
          name="firstName"
          label="Nombre"
          autoComplete="given-name"
          value={firstName}
          onChange={(event) => onFirstNameChange(event.target.value)}
        />
        <Input
          id="lastName"
          name="lastName"
          label="Apellido"
          autoComplete="family-name"
          value={lastName}
          onChange={(event) => onLastNameChange(event.target.value)}
        />
      </div>
      <Input
        id="age"
        name="age"
        label="Edad"
        type="number"
        inputMode="numeric"
        min={0}
        max={120}
        className="max-w-32"
        value={age}
        onChange={(event) => onAgeChange(event.target.value)}
      />
      <Textarea
        id="professionalNotes"
        name="professionalNotes"
        label="Notas de la profesional"
        optional
        value={professionalNotes}
        onChange={(event) => onProfessionalNotesChange(event.target.value)}
      />
    </>
  );
}
