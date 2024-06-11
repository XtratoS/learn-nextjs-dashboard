import { Inter, Lusitana, Cairo } from 'next/font/google';

export const inter = Inter({subsets: ['latin']});

export const lusitana = Lusitana({
  subsets: ['latin'],
  weight: ['400', '700']
});

export const cairo = Cairo({
  subsets: ['latin'],
  weight: ['200','300','400','500','600','700','800','900']
})