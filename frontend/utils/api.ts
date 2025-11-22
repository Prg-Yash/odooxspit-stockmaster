export async function makeApiRequest({
  endpoint,
  opts,
}: {
  endpoint: string;
  opts: RequestInit;
}) {
  const apiURL = process.env.NEXT_PUBLIC_API_URL;

  if (!apiURL) throw new Error("API URL IS NOT DEFINED");

  if (!endpoint.startsWith("/"))
    throw new Error("Endpoints must start with leading slash");

  return await fetch(`${apiURL}${endpoint}`, {
    credentials: "include",
    ...opts,
  });
}
