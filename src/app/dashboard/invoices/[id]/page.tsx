"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [id, setId] = useState("");
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then((p) => { setId(p.id); fetchInvoice(p.id); });
  }, [params]);

  async function fetchInvoice(invoiceId: string) {
    const res = await fetch(`/api/invoices/${invoiceId}`);
    if (res.ok) { setInvoice(await res.json()); }
    else { router.push("/dashboard/invoices"); }
    setLoading(false);
  }

  async function updateStatus(newStatus: string) {
    if (!invoice) return;
    const res = await fetch(`/api/invoices/${invoice.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) { toast.success(`Invoice marked as ${newStatus}`); fetchInvoice(invoice.id); }
    else { toast.error("Failed to update status"); }
  }

  if (loading) {
    return <div className="max-w-4xl mx-auto py-12 text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
    </div>;
  }

  if (!invoice) {
    return <div className="max-w-4xl mx-auto py-12 text-center">
      <p className="text-gray-600">Invoice not found</p>
    </div>;
  }

  const statusColors: Record<string, string> = {
    draft: "bg-yellow-100 text-yellow-800",
    sent: "bg-blue-100 text-blue-800",
    paid: "bg-green-100 text-green-800",
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoice #{invoice.invoice_number}</h1>
          <p className="text-gray-600">View and manage this invoice</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={invoice.status === "paid"} onClick={() => updateStatus("paid")}>
            Mark as Paid
          </Button>
          <Button variant="outline" disabled={invoice.status !== "draft"} onClick={() => updateStatus("sent")}>
            Send Invoice
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Bill To</CardTitle></CardHeader>
          <CardContent>
            <p className="font-semibold">{invoice.client_name}</p>
            <p className="text-gray-600 text-sm">{invoice.client_email}</p>
            {invoice.client_address && <p className="text-gray-600 text-sm mt-1">{invoice.client_address}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Invoice Details</CardTitle></CardHeader>
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
      </div>

      <Card>
        <CardHeader><CardTitle>Line Items</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {invoice.line_items.map((item: any) => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-0">
                <div className="flex-1">
                  <p className="font-medium">{item.description}</p>
                  <p className="text-sm text-gray-600">{item.quantity} x ${Number(item.price).toFixed(2)}</p>
                </div>
                <div className="text-right font-medium">
                  ${(Number(item.quantity) * Number(item.price)).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-2 border-t pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">${Number(invoice.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax ({invoice.tax_rate}%)</span>
              <span className="font-medium">${Number(invoice.tax_amount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total</span>
              <span>${Number(invoice.total_amount).toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Actions</CardTitle></CardHeader>
        <CardContent className="flex gap-2">
          <Button variant="outline" onClick={() => { if (invoice.status !== "paid") updateStatus("paid"); }} disabled={invoice.status === "paid"}>
            Mark as Paid
          </Button>
          <Button variant="outline" onClick={() => router.push(`/dashboard/invoices/${invoice.id}/edit`)}>
            Edit Invoice
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}