import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function SupabaseSetupNotice() {
  return (
    <Card padding="comfortable">
      <p className="text-base leading-relaxed text-foreground">
        Falta configurar el acceso a la base de datos para ver y guardar
        consultantes.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Completá la URL y la clave pública del proyecto en las variables de
        entorno.
      </p>
      <div className="mt-8">
        <Button href="/clients/new">Nuevo consultante</Button>
      </div>
    </Card>
  );
}
