import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: invoices, error } = await supabase
    .from("invoices")
    .select("*, line_items(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(invoices || []);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    client_name,
    client_email,
    client_address,
    invoice_number,
    issue_date,
    due_date,
    tax_rate,
    line_items,
  } = body;

  const { data: invoice, error } = await supabase
    .from("invoices")
    .insert({
      user_id: user.id,
      client_name,
      client_email,
      client_address,
      invoice_number,
      issue_date,
      due_date,
      tax_rate: tax_rate || 0,
      status: "draft",
      subtotal: 0,
      tax_amount: 0,
      total_amount: 0,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Insert line items
  if (line_items && line_items.length > 0) {
    const items = line_items.map((item: any) => ({
      invoice_id: invoice.id,
      description: item.description,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await supabase.from("line_items").insert(items);
    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }
  }

  // Refetch with totals updated by trigger
  const { data: updatedInvoice } = await supabase
    .from("invoices")
    .select("*, line_items(*)")
    .eq("id", invoice.id)
    .single();

  return NextResponse.json(updatedInvoice);
}