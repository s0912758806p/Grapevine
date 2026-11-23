"use client";

import dynamic from "next/dynamic";
import type { MeetupPin } from "./MeetupMap";

const MeetupMap = dynamic(() => import("./MeetupMap"), {
  ssr: false,
  loading: () => <div className="card" style={{ minHeight: 380, background: "var(--map-land)" }} aria-label="地圖載入中" />,
});

export function MeetupMapLoader({ pins }: { pins: MeetupPin[] }) {
  return <MeetupMap pins={pins} />;
}
