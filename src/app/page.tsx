import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900">SimpleBill</h1>
          <p className="text-xl text-gray-600 mt-2">Simple invoicing for freelancers and small businesses</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="p-6">
            <CardHeader>
              <CardTitle>Create Invoices</CardTitle>
              <CardDescription>Professional invoices in minutes</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Add line items, calculate totals, and apply tax automatically.</p>
            </CardContent>
          </Card>
          <Card className="p-6">
            <CardHeader>
              <CardTitle>Send & Track</CardTitle>
              <CardDescription>Email PDFs directly to clients</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Send invoices via email and track payment status.</p>
            </CardContent>
          </Card>
          <Card className="p-6">
            <CardHeader>
              <CardTitle>Get Paid Faster</CardTitle>
              <CardDescription>Professional PDFs every time</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Download polished PDFs that look great on any device.</p>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-md mx-auto space-y-4">
          <Link href="/signup">
            <Button size="lg" className="w-full">
              Get Started Free
            </Button>
          </Link>
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}