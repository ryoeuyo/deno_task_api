"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, type Task, type TaskInput } from "@/lib/api";
import { Window, Divider } from "@/components/Window";
import { TaskForm } from "@/components/TaskForm";

export default function HomePage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [errorMsg, setErrorMsg] = useState("");
  const [creating, setCreating] = useState(false);

  async function load() {
    setStatus("loading");
    try {
      setTasks(await api.list());
      setStatus("ready");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "failed to reach api");
      setStatus("error");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(data: TaskInput) {
    await api.create(data);
    setCreating(false);
    await load();
  }

  return (
    <main className="screen">
      <Window title={<b>~/tasks</b>} meta="kanagawa · zsh">
        <div className="prompt">
          <span className="sym">❯</span>
          <span className="cmd">tasks</span> <span className="flag">--list</span>
          <span className="cursor" />
        </div>

        <div className="toolbar">
          <span className="count">
            <b>{tasks.length}</b> task{tasks.length === 1 ? "" : "s"} on record
          </span>
          <button className="btn green" onClick={() => setCreating(true)}>
            + new task
          </button>
        </div>

        <Divider />

        {status === "loading" && (
          <div className="state">
            fetching tasks<span className="cursor" />
          </div>
        )}

        {status === "error" && (
          <div className="msg error">
            {errorMsg} — is the api running on :8000?
          </div>
        )}

        {status === "ready" && tasks.length === 0 && (
          <div className="empty">
            <span className="big">
              {"  ╭─────────────╮\n  │   no tasks  │\n  ╰─────────────╯"}
            </span>
            nothing here yet — hit{" "}
            <span style={{ color: "var(--spring-green)" }}>[ + new task ]</span>
          </div>
        )}

        {status === "ready" && tasks.length > 0 && (
          <div className="tasklist">
            {tasks.map((t) => (
              <div
                key={t.id}
                className="task-row"
                onClick={() => router.push(`/task/${t.id}`)}
              >
                <span className="marker">▸</span>
                <span className="task-id">
                  #{String(t.id).padStart(2, "0")}
                </span>
                <span className="task-name">{t.name}</span>
                <span className="task-desc">{t.description}</span>
                <span className="open">open →</span>
              </div>
            ))}
          </div>
        )}
      </Window>

      {creating && (
        <div className="overlay" onClick={() => setCreating(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <Window title={<b>~/tasks/new</b>} meta="insert">
              <div className="section-label">
                <span className="hash"># </span>create task
              </div>
              <TaskForm
                submitLabel="create"
                onSubmit={handleCreate}
                onCancel={() => setCreating(false)}
              />
            </Window>
          </div>
        </div>
      )}
    </main>
  );
}
