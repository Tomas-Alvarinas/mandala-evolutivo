type CoverMarkProps = {
  className?: string;
};

export function CoverMark({ className }: CoverMarkProps) {
  return (
    <svg
      className={className}
      width="148"
      height="148"
      viewBox="0 0 148 148"
      aria-hidden="true"
    >
      <g
        fill="none"
        stroke="#8a5a44"
        strokeWidth="0.9"
        opacity="0.72"
      >
        <circle cx="74" cy="74" r="18" />
        <circle cx="74" cy="74" r="34" />
        <circle cx="74" cy="74" r="52" />
        <circle cx="74" cy="74" r="68" />
        <path d="M74 6 V142" />
        <path d="M6 74 H142" />
        <path d="M26 26 L122 122" />
        <path d="M122 26 L26 122" />
      </g>
    </svg>
  );
}
