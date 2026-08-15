import { redirect } from 'next/navigation';

export default async function ChatRedirectPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
}) {
  const resolved = props.searchParams instanceof Promise ? await props.searchParams : (props.searchParams || {});
  const query = new URLSearchParams();
  for (const [k, v] of Object.entries(resolved)) {
    if (typeof v === 'string') query.set(k, v);
    else if (Array.isArray(v) && v[0]) query.set(k, v[0]);
  }

  const qs = query.toString();
  redirect(qs ? `/chatbot?${qs}` : '/chatbot');
}
