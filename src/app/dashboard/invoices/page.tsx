import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

export default async function InvoicesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: invoices } = await supabase
    .from("invoices")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const statusColors: Record<string, string> = {
    draft: "bg-yellow-100 text-yellow-800",
    sent: "bg-blue-100 text-blue-800",
    paid: "bg-green-100 text-green-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600">Manage your invoices</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/invoices/new">Create Invoice</Link>
        </Button>
      </div>

      {invoices && invoices.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {invoices.map((invoice) => (
            <Link key={invoice.id} href={`/dashboard/invoices/${invoice.id}`} className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Invoice #{invoice.invoice_number}</p>
                      <p className="text-lg font-semibold text-gray-900">{invoice.client_name}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[invoice.status] || "bg-gray-100 text-gray-800"}`}>
                      {invoice.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>{invoice.client_email}</p>
                    <p>Issue: {format(new Date(invoice.issue_date), "MMM d, yyyy")}</p>
                    <p>Due: {format(new Date(invoice.due_date), "MMM d, yyyy")}</p>
                  </div>
                  <div className="mt-4 pt-4 border-t flex justify-between items-center">
                    <span className="text-2xl font-bold text-gray-900">${invoice.total_amount.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600 mb-4">No invoices yet</p>
            <Button asChild>
              <Link href="/dashboard/invoices/new">Create your first invoice</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}