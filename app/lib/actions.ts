'use server';

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const invoiceFormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});

const CreateInvoice = invoiceFormSchema.omit({ id: true });

export async function createInvoice(formData: FormData) {
  const customerId = formData.get('customerId');
  const status = formData.get('status');

  const amount = formData.get('amount');
  const numberAmount = Number(amount);
  const centAmount = numberAmount * 100;
  
  const validatedData = CreateInvoice.parse({
    customerId,
    amount: centAmount,
    status,
    date: new Date().toISOString().split('T')[0],
  });

  await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${validatedData.customerId}, ${validatedData.amount}, ${validatedData.status}, ${validatedData.date})
  `;

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}