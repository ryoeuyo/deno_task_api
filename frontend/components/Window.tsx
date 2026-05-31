import type { ReactNode } from "react";

export function Window({
  title,
  meta,
  children,
}: {
  title: ReactNode;
  meta?: string;
  children: ReactNode;
}) {
  return (
    <div className="window">
      <div className="titlebar">
        <span className="dot red" />
        <span className="dot yellow" />
        <span className="dot green" />
        <span className="title">{title}</span>
        <span className="spacer" />
        {meta && <span className="meta">{meta}</span>}
      </div>
      <div className="window-body">{children}</div>
    </div>
  );
}

export function Divider({ width = 64 }: { width?: number }) {
  return <div className="divider">{"─".repeat(width)}</div>;
}
