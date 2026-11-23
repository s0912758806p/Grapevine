import Link from "next/link";
import { Columns } from "@/components/layout/Columns";

export default function NotFound() {
  return (
    <Columns nav={false}>
      <div className="card empty">
        <strong>找不到這個頁面</strong>
        <span style={{ fontSize: 14 }}>
          主題可能已被刪除，或網址打錯了。<Link href="/">回到動態牆</Link>
        </span>
      </div>
    </Columns>
  );
}
