import { redirect } from 'next/navigation';

export default async function ChatRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  for (const [k, v] of Object.entries(params || {})) {
    if (typeof v === 'string') query.set(k, v);
    else if (Array.isArray(v) && v[0]) query.set(k, v[0]);
  }

  const qs = query.toString();
  redirect(qs ? `/chatbot?${qs}` : '/chatbot');
}
