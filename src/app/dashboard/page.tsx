import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Eye, Edit, Trash2, DollarSign } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: invoices } = await supabase
    .from("invoices")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false });

  const stats = {
    total: invoices?.length || 0,
    draft: invoices?.filter(i => i.status === "draft").length || 0,
    sent: invoices?.filter(i => i.status === "sent").length || 0,
    paid: invoices?.filter(i => i.status === "paid").length || 0,
    totalRevenue: invoices?.reduce((sum, i) => sum + (i.total_amount || 0), 0) || 0,
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.email}</p>
        </div>
        <Link href="/dashboard/invoices/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Draft: {stats.draft} | Sent: {stats.sent} | Paid: {stats.paid}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sent}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid This Month</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.paid > 0 ? stats.totalRevenue.toFixed(2) : "0.00"}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Invoices</h2>
          <Link href="/dashboard/invoices/new">
            <Button variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Create Invoice
            </Button>
          </Link>
        </div>

        {invoices && invoices.length > 0 ? (
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoices.slice(0, 10).map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-900">{invoice.invoice_number}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-gray-900">{invoice.client_name}</div>
                      <div className="text-sm text-gray-500">{invoice.client_email}</div>
                    </td>
                    <td className="px-4 py-4 text-gray-900">
                      {format(new Date(invoice.issue_date), "MMM d, yyyy")}
                    </td>
                    <td className="px-4 py-4 text-gray-900">
                      {format(new Date(invoice.due_date), "MMM d, yyyy")}
                    </td>
                    <td className="px-4 py-4 font-medium text-gray-900">
                      ${invoice.total_amount?.toFixed(2) || "0.00"}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        invoice.status === "draft" ? "bg-gray-100 text-gray-800" :
                        invoice.status === "sent" ? "bg-blue-100 text-blue-800" :
                        invoice.status === "paid" ? "bg-green-100 text-green-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/dashboard/invoices/${invoice.id}`} className="text-gray-500 hover:text-gray-700">
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link href={`/dashboard/invoices/${invoice.id}/edit`} className="text-gray-500 hover:text-gray-700">
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button className="text-gray-500 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="mx-auto mb-4 h-12 w-12 text-gray-400">
                <DollarSign className="h-12 w-12" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-gray-900">No invoices yet</h3>
              <p className="mb-4 text-gray-500">Create your first invoice to get started</p>
              <Link href="/dashboard/invoices/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Invoice
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}