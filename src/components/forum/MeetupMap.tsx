"use client";

/**
 * Leaflet map of meetups (replaces the v1 Location page). Loaded client-only
 * via MeetupMapLoader because Leaflet touches `window` on import. Uses circle
 * markers so no marker image assets are needed.
 */
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";

export interface MeetupPin {
  number: number;
  title: string;
  city: string;
  when: string;
  lat: number;
  lng: number;
}

export default function MeetupMap({ pins }: { pins: MeetupPin[] }) {
  return (
    <MapContainer center={[24.6, 121.0]} zoom={8} scrollWheelZoom={false} style={{ height: "100%", minHeight: 380, borderRadius: 14 }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {pins.map((p) => (
        <CircleMarker key={p.number} center={[p.lat, p.lng]} radius={11} pathOptions={{ color: "#ffffff", weight: 3, fillColor: "#5e2a69", fillOpacity: 1 }}>
          <Popup>
            <strong>{p.city}</strong>
            <br />
            <Link href={`/t/${p.number}`}>{p.title}</Link>
            <br />
            {p.when}
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
