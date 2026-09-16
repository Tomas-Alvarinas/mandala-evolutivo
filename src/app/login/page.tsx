import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { APP_NAME } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Ingresar",
};

export default function LoginPage() {
  return (
    <PageContainer size="narrow" className="flex flex-col justify-center">
      <Card padding="comfortable">
        <h1 className="text-page-title">{APP_NAME}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Ingresá para continuar con tu trabajo.
        </p>
        {isSupabaseConfigured() ? (
          <div className="mt-8">
            <LoginForm />
          </div>
        ) : (
          <p className="mt-6 text-sm leading-relaxed text-muted">
            Falta configurar el acceso a la base de datos. Completá la URL y la
            clave pública del proyecto en las variables de entorno.
          </p>
        )}
      </Card>
    </PageContainer>
  );
}
