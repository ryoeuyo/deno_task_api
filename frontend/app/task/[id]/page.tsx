"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, type Task, type TaskInput } from "@/lib/api";
import { Window, Divider } from "@/components/Window";
import { TaskForm } from "@/components/TaskForm";

export default function TaskDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [task, setTask] = useState<Task | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [errorMsg, setErrorMsg] = useState("");
  const [editing, setEditing] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setStatus("loading");
    try {
      setTask(await api.get(id));
      setStatus("ready");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "not found");
      setStatus("error");
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function handleUpdate(data: TaskInput) {
    const updated = await api.update(id, data);
    setTask(updated);
    setEditing(false);
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await api.remove(id);
      router.push("/");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "delete failed");
      setDeleting(false);
      setConfirmDel(false);
    }
  }

  const padded = String(id).padStart(2, "0");

  return (
    <main className="screen">
      <Window title={<b>~/tasks/{padded}</b>} meta={editing ? "insert" : "normal"}>
        <div className="prompt">
          <span className="sym">❯</span>
          <span className="cmd">tasks</span>{" "}
          <span className="flag">--open {id}</span>
          <span className="cursor" />
        </div>

        <Divider />

        {status === "loading" && (
          <div className="state">
            loading task #{padded}
            <span className="cursor" />
          </div>
        )}

        {status === "error" && (
          <>
            <div className="msg error">{errorMsg}</div>
            <div className="btn-row">
              <button className="btn blue" onClick={() => router.push("/")}>
                ← back to list
              </button>
            </div>
          </>
        )}

        {status === "ready" && task && !editing && (
          <>
            <div className="detail-head">
              <span className="detail-id">#{padded}</span>
              <span className="detail-name">{task.name}</span>
            </div>

            <div className="field-block">
              <div className="field-key">description</div>
              <div className="field-value">{task.description}</div>
            </div>

            {confirmDel ? (
              <>
                <div className="msg error">
                  delete task #{padded} permanently? this cannot be undone.
                </div>
                <div className="btn-row">
                  <button
                    className="btn red"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? "deleting…" : "yes, rm -f"}
                  </button>
                  <button
                    className="btn"
                    onClick={() => setConfirmDel(false)}
                    disabled={deleting}
                  >
                    cancel
                  </button>
                </div>
              </>
            ) : (
              <div className="btn-row">
                <button className="btn blue" onClick={() => router.push("/")}>
                  ← back
                </button>
                <button className="btn yellow" onClick={() => setEditing(true)}>
                  edit
                </button>
                <button className="btn red" onClick={() => setConfirmDel(true)}>
                  delete
                </button>
              </div>
            )}
          </>
        )}

        {status === "ready" && task && editing && (
          <>
            <div className="section-label">
              <span className="hash"># </span>edit task #{padded}
            </div>
            <TaskForm
              initial={{ name: task.name, description: task.description }}
              submitLabel="save changes"
              onSubmit={handleUpdate}
              onCancel={() => setEditing(false)}
            />
          </>
        )}
      </Window>
    </main>
  );
}
