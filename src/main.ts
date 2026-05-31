import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { zValidator } from "@hono/zod-validator";
import { drizzle } from 'drizzle-orm/node-postgres'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { SaveTaskRequest } from "./requests/task.ts";
import { tasksTable } from "./db/schema.ts";

const idParam = z.object({ id: z.coerce.number().int().positive() });

const db = drizzle(process.env.DATABASE_URL!)
const app = new Hono()
const task = new Hono().basePath('/task')

app.use('*', cors({
  origin: 'http://localhost:3000',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}))

app.get('/', (c) => {
  return c.json({ message: "Hello, World" }, 200)
})

task.post('/', zValidator("json", SaveTaskRequest), async (c) => {
  const body = c.req.valid("json");
  const [task] = await db.insert(tasksTable).values(body).returning();
  return c.json(task, 201)
});

task.get('/', async (c) => {
  const tasks = await db.select().from(tasksTable).limit(15);

  return c.json(tasks, 200)
});

task.get('/:id', zValidator("param", idParam), async (c) => {
  const { id } = c.req.valid("param");
  const [task] = await db.select().from(tasksTable).where(eq(tasksTable.id, id));

  if (!task) return c.json({ error: "Task not found" }, 404)
  return c.json(task, 200)
});

task.put('/:id', zValidator("param", idParam), zValidator("json", SaveTaskRequest), async (c) => {
  const { id } = c.req.valid("param");
  const body = c.req.valid("json");
  const [task] = await db.update(tasksTable).set(body).where(eq(tasksTable.id, id)).returning();

  if (!task) return c.json({ error: "Task not found" }, 404)
  return c.json(task, 200)
});

task.delete('/:id', zValidator("param", idParam), async (c) => {
  const { id } = c.req.valid("param");
  const [task] = await db.delete(tasksTable).where(eq(tasksTable.id, id)).returning();

  if (!task) return c.json({ error: "Task not found" }, 404)
  return c.json({ deleted: task }, 200)
});

app.route('/', task)

Deno.serve(app.fetch)
