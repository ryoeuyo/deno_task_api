const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface Task {
  id: number;
  name: string;
  description: string;
}

export interface TaskInput {
  name: string;
  description: string;
}

const JSON_HEADERS = { "Content-Type": "application/json" };

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `request failed [${res.status}]`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
      else if (body) message = JSON.stringify(body);
    } catch {
      /* response had no json body */
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export const api = {
  list: () => fetch(`${BASE}/task`).then((r) => handle<Task[]>(r)),

  get: (id: number | string) =>
    fetch(`${BASE}/task/${id}`).then((r) => handle<Task>(r)),

  create: (data: TaskInput) =>
    fetch(`${BASE}/task`, {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(data),
    }).then((r) => handle<Task>(r)),

  update: (id: number | string, data: TaskInput) =>
    fetch(`${BASE}/task/${id}`, {
      method: "PUT",
      headers: JSON_HEADERS,
      body: JSON.stringify(data),
    }).then((r) => handle<Task>(r)),

  remove: (id: number | string) =>
    fetch(`${BASE}/task/${id}`, { method: "DELETE" }).then((r) =>
      handle<{ deleted: Task }>(r),
    ),
};
