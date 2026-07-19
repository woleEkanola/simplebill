"use client";

import { createClient } from "@/lib/supabase/client";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleSignOut}>
      Sign out
    </Button>
  );
}