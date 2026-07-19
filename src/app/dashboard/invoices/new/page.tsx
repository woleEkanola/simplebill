"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [taxRate, setTaxRate] = useState(0);
  const [lineItems, setLineItems] = useState<LineItem[]>([{ id: crypto.randomUUID(), description: "", quantity: 1, price: 0 }]);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    if (!issueDate) setIssueDate(today);
    if (!dueDate) setDueDate(nextMonth);
  }, [issueDate, dueDate]);

  useEffect(() => {
    const num = `INV-${Date.now().toString(36).toUpperCase()}`;
    setInvoiceNumber(num);
  }, []);

  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const taxAmount = subtotal * taxRate / 100;
  const total = subtotal + taxAmount;

  const addLineItem = () => {
    setLineItems([...lineItems, { id: crypto.randomUUID(), description: "", quantity: 1, price: 0 }]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems(lineItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const saveInvoice = async (status: "draft" | "sent") => {
    if (!clientName || !clientEmail) {
      toast.error("Client name and email are required");
      return;
    }

    const validItems = lineItems.filter(item => item.description && item.quantity > 0 && item.price > 0);
    if (validItems.length === 0) {
      toast.error("Add at least one line item");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_name: clientName,
          client_email: clientEmail,
          client_address: clientAddress,
          invoice_number: invoiceNumber,
          issue_date: issueDate,
          due_date: dueDate,
          tax_rate: taxRate,
          status,
          line_items: validItems,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");

      const data = await res.json();
      toast.success(status === "draft" ? "Saved as draft" : "Invoice sent!");
      router.push(`/dashboard/invoices/${data.id}`);
      router.refresh();
    } catch (error) {
      toast.error("Failed to save invoice");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">New Invoice</h1>
          <p className="text-gray-600">Create a professional invoice for your client</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Client Details</CardTitle>
              <CardDescription>Information about who you're billing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoice_number">Invoice Number</Label>
                  <Input id="invoice_number" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="issue_date">Issue Date</Label>
                  <Input id="issue_date" type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input id="due_date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                  <Input
                    id="tax_rate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_name">Client Name *</Label>
                <Input id="client_name" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Client's full name" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_email">Client Email *</Label>
                <Input id="client_email" type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="client@example.com" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_address">Client Address</Label>
                <Input id="client_address" value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} placeholder="123 Main St, City, State 12345" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle>Line Items</CardTitle>
                <CardDescription>Products or services you're billing for</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={addLineItem}>
                <Plus className="mr-1 h-4 w-4" />
                Add Item
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lineItems.map((item, index) => (
                  <div key={item.id} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs text-gray-500">Description</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => updateLineItem(item.id, "description", e.target.value)}
                        placeholder="Web design services"
                      />
                    </div>
                    <div className="w-full sm:w-24 space-y-1">
                      <Label className="text-xs text-gray-500">Qty</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(item.id, "quantity", parseInt(e.target.value) || 1)}
                        className="text-right"
                      />
                    </div>
                    <div className="w-full sm:w-28 space-y-1">
                      <Label className="text-xs text-gray-500">Price</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.price}
                        onChange={(e) => updateLineItem(item.id, "price", parseFloat(e.target.value) || 0)}
                        className="text-right"
                      />
                    </div>
                    <div className="w-full sm:w-28 space-y-1 text-right">
                      <Label className="text-xs text-gray-500">Total</Label>
                      <div className="font-mono font-medium text-gray-900">
                        ${(item.quantity * item.price).toFixed(2)}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLineItem(item.id)}
                      disabled={lineItems.length === 1}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax ({taxRate}%)</span>
                  <span className="font-medium">${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 pt-4 border-t">
                <Button className="w-full" size="lg" onClick={() => saveInvoice("draft")} disabled={saving}>
                  {saving ? "Saving..." : "Save as Draft"}
                </Button>
                <Button className="w-full" size="lg" variant="default" onClick={() => saveInvoice("sent")} disabled={saving}>
                  {saving ? "Sending..." : "Save & Send"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}