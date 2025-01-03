"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { api } from "@/lib/api";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error, data: authData } = await supabase.auth.signInWithPassword(
    data
  );

  if (error) {
    return redirect(`/login?error=${error.message}`);
  }

  if (!authData.session) {
    return redirect(`/login?error=No session created`);
  }

  revalidatePath("/", "layout");

  return redirect("/dashboard");
}

export async function register(formData: FormData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    name: formData.get("name") as string,
  };

  const { data: user, error } = await supabase.auth.signUp(data);

  if (error) {
    redirect(`/register?error=${error.message}`);
  }

  if (!user || !user.user) {
    redirect(`/register?error=User not found`);
  }

  await api.users.register(user.user!.id, data.name);

  revalidatePath("/", "layout");
  redirect("/choose-homeworld");
}
