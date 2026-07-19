"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const business_name = formData.get("business_name") as string;
  const address = formData.get("address") as string;
  const logo_url = formData.get("logo_url") as string;

  const { error } = await supabase
    .from("profiles")
    .update({
      business_name,
      address,
      logo_url,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  redirect("/dashboard/profile?saved=true");
}