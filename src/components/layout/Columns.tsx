/**
 * Three-column page frame from the design: side nav (desktop), main column,
 * optional right rail. Collapses to one column below 1024px / 768px.
 */
import type { ReactNode } from "react";
import { SideNav } from "./Nav";

export function Columns({ children, aside, nav = true }: { children: ReactNode; aside?: ReactNode; nav?: boolean }) {
  return (
    <div className={`${nav ? "container" : "container-narrow"} page cols`}>
      {nav && (
        <div className="col-nav">
          <SideNav />
        </div>
      )}
      <main id="main" className="col-main">
        {children}
      </main>
      {aside && (
        <aside className="col-aside" aria-label="側欄">
          {aside}
        </aside>
      )}
    </div>
  );
}
