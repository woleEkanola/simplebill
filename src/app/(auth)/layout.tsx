import { Metadata } from "next";

export const metadata: Metadata = {
  title: "SimpleBill - Authentication",
  description: "Sign in or create an account to manage your invoices",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      {children}
    </div>
  );
}