/// <reference types="vite/client" />

interface ImportMeta {
  readonly env: Record<string, string>;
}

declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";
declare module "*.svg";
declare module "*.gif";
