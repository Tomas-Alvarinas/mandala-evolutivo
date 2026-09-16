export const containerMaxWidthClass = {
  narrow: "max-w-xl",
  default: "max-w-3xl",
  wide: "max-w-4xl",
} as const;

export const containerPaddingXClass = "px-6 sm:px-8";

export type ContainerSize = keyof typeof containerMaxWidthClass;
