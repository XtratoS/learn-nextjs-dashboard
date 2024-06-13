import { fetchCustomers, fetchInvoiceById } from "@/app/lib/data";
import Breadcrumbs from "@/app/ui/invoices/breadcrumbs";
import Form from "@/app/ui/invoices/edit-form";
import { Suspense } from "react";

export default async function Page({ params }: { params: { id: string }}) {
  const { id } = params;
  const [customers] = await Promise.all([
    fetchCustomers()
  ]);

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { href: '/dashboard/invoices', label: 'Invoices' },
          { href: `/dashboard/invoices/${id}/edit`, label: 'Edit', active: true}
        ]}
      />
      <Suspense fallback={<div>Loading...</div>}>
        <Form invoiceId={id} customers={customers} />
      </Suspense>
    </main>
  )
}