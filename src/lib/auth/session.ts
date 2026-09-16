import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const getAuthenticatedUser = cache(async function getAuthenticatedUser() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
});
