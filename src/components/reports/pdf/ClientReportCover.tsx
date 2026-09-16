import { CoverMark } from "./CoverMark";

export type PdfCoverContent = {
  title: string;
  subtitle: string;
  clientName: string;
};

type ClientReportCoverProps = {
  cover: PdfCoverContent;
  date?: string;
};

export function ClientReportCover({ cover, date }: ClientReportCoverProps) {
  return (
    <header className="cover">
      <CoverMark className="cover-mark" />
      <p className="cover-kicker">Mandala Evolutivo</p>
      <h1 className="cover-title">{cover.title}</h1>
      <p className="cover-subtitle">{cover.subtitle}</p>
      <p className="cover-name">{cover.clientName}</p>
      {date ? <p className="cover-date">{date}</p> : null}
    </header>
  );
}
