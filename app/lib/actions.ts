'use server';

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
}

const invoiceFormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce.number().gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});

const CreateInvoice = invoiceFormSchema.omit({ id: true });
const UpdateInvoice = invoiceFormSchema.omit({ id: true, date: true });

export async function createInvoice(prevState: State, formData: FormData) {
  const customerId = formData.get('customerId');
  const status = formData.get('status');

  const amount = formData.get('amount');
  const numberAmount = Number(amount);
  const centAmount = numberAmount * 100;
  
  const validatedData = CreateInvoice.safeParse({
    customerId,
    amount: centAmount,
    status,
    date: new Date().toISOString().split('T')[0],
  });

  if (!validatedData.success) {
    return {
      errors: validatedData.error.flatten().fieldErrors,
      message: 'Missing Fields or Invalid Data. Failed to Create Invoice'
    };
  }

  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${validatedData.data.customerId}, ${validatedData.data.amount}, ${validatedData.data.status}, ${validatedData.data.date})
    `;
  } catch (error) {
    return { message: 'Database Error: Failed to Create Invoice' };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function updateInvoice(id: string, formData: FormData) {
  const customerId = formData.get('customerId');
  const status = formData.get('status');

  const amount = formData.get('amount');
  const numberAmount = Number(amount);
  const centAmount = numberAmount * 100;

  const validatedData = UpdateInvoice.parse({
    customerId,
    amount: centAmount,
    status
  });

  try {
    await sql`
      UPDATE invoices
      SET customer_id = ${validatedData.customerId},
          amount = ${validatedData.amount},
          status = ${validatedData.status}
      WHERE id = ${id}
    `;
  } catch (error) {
    return { message: 'Database Error: Failed to Update Invoice' };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  try {
    await sql`
      DELETE FROM invoices
      WHERE id = ${id}
    `;
  } catch (error) {
    return { message: 'Database Error: Failed to update invoice' };
  }

  revalidatePath('/dashboard/invoices');
}