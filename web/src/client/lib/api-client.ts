import { isServer } from "@tanstack/react-query";

function getBaseURL() {
  if (!isServer) return "";
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export const baseUrl = getBaseURL();

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = path.startsWith("http") ? path : `${baseUrl}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error en la petición");
  return data;
}
