import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface InvoiceDetailProps {
  params: Promise<{ id: string }>;
}

export default async function InvoiceDetailPage({ params }: InvoiceDetailProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;

  const { data: invoice, error } = await supabase
    .from("invoices")
    .select("*, line_items(*)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !invoice) {
    notFound();
  }

  const statusColors: Record<string, string> = {
    draft: "bg-yellow-100 text-yellow-800",
    sent: "bg-blue-100 text-blue-800",
    paid: "bg-green-100 text-green-800",
  };

  // Calculate totals from line items
  const subtotal = invoice.line_items.reduce((sum: number, item: any) => sum + Number(item.quantity) * Number(item.price), 0);
  const taxAmount = subtotal * Number(invoice.tax_rate) / 100;
  const totalAmount = subtotal + taxAmount;

  async function updateStatus(invoiceId: string, status: string) {
    const res = await fetch(`/api/invoices/${invoiceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) window.location.reload();
  }

  async function downloadPDF(invoiceData: any) {
    const res = await fetch(`/api/invoices/${invoiceData.id}/pdf`);
    if (res.ok) {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${invoiceData.invoice_number}.pdf`;
      a.click();
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoice #{invoice.invoice_number}</h1>
          <p className="text-gray-600">View and manage this invoice</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={invoice.status === "paid"} onClick={() => updateStatus(id, "paid")}>
            Mark as Paid
          </Button>
          <Button variant="outline" disabled={invoice.status !== "draft"} onClick={() => updateStatus(id, "sent")}>
            Send Invoice
          </Button>
          <Button onClick={() => downloadPDF(invoice)}>Download PDF</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>From</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">Your Business</p>
            <p className="text-gray-600 text-sm">Configure in Profile</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bill To</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">{invoice.client_name}</p>
            <p className="text-gray-600 text-sm">{invoice.client_email}</p>
            {invoice.client_address && <p className="text-gray-600 text-sm mt-1">{invoice.client_address}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Issue Date</span>
              <span className="font-medium">{format(new Date(invoice.issue_date), "MMM d, yyyy")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Due Date</span>
              <span className="font-medium">{format(new Date(invoice.due_date), "MMM d, yyyy")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax Rate</span>
              <span className="font-medium">{invoice.tax_rate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status</span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[invoice.status] || "bg-gray-100 text-gray-800"}`}>
                {invoice.status}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm">Payment integration coming in Phase 3</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-gray-600">
                  <th className="pb-2 w-1/2">Description</th>
                  <th className="pb-2 w-1/6 text-right">Qty</th>
                  <th className="pb-2 w-1/6 text-right">Price</th>
                  <th className="pb-2 w-1/6 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.line_items.map((item: any) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="py-3">{item.description}</td>
                    <td className="py-3 text-right">{item.quantity}</td>
                    <td className="py-3 text-right">${Number(item.price).toFixed(2)}</td>
                    <td className="py-3 text-right font-medium">${(Number(item.quantity) * Number(item.price)).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t">
                <tr>
                  <td colSpan={3} className="py-3 text-right font-medium">Subtotal</td>
                  <td className="py-3 text-right font-medium">${subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="py-3 text-right font-medium">Tax ({invoice.tax_rate}%)</td>
                  <td className="py-3 text-right font-medium">${taxAmount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="py-3 text-right font-bold text-lg">Total</td>
                  <td className="py-3 text-right font-bold text-lg">${totalAmount.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
    </div>
  );
}