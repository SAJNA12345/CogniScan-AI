// Single place for talking to the Express API. Always attaches the JWT.

function authHeaders(): Record<string, string> {
  const t = localStorage.getItem("token");
  return t ? { Authorization: `Bearer ${t}` } : {};
}

async function handle(res: Response) {
  const text = await res.text();
  let data: any;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }
  if (!res.ok) {
    throw new Error(data?.detail || data?.message || `Request failed (${res.status})`);
  }
  return data;
}

export async function apiGet(path: string) {
  return handle(await fetch(path, { headers: authHeaders() }));
}

export async function apiPost(path: string, body?: unknown) {
  return handle(
    await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(body ?? {}),
    })
  );
}

export async function apiUpload(path: string, form: FormData) {
  return handle(
    await fetch(path, { method: "POST", headers: authHeaders(), body: form })
  );
}
