/**
 * Small presentational pieces shared by forum pages: avatars, board chips,
 * member links and Markdown rendering. All server-renderable.
 */
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { Icon } from "@/components/Icon";
import { getBoard } from "@/lib/boards";
import { avatarColor, initialOf } from "@/lib/format";
import type { Member } from "@/lib/forum/types";

export function Avatar({ member, size = 28, anonymous = false }: { member: Member; size?: number; anonymous?: boolean }) {
  const style = { width: size, height: size, fontSize: Math.round(size * 0.42) };
  if (anonymous) {
    return (
      <span className="avatar tone-rose" style={style} aria-hidden="true">
        ?
      </span>
    );
  }
  if (member.avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element -- GitHub avatars are tiny and already CDN-sized.
    return <img className="avatar" src={member.avatarUrl} alt="" width={size} height={size} style={style} />;
  }
  return (
    <span className="avatar" style={{ ...style, background: avatarColor(member.login) }} aria-hidden="true">
      {initialOf(member.name)}
    </span>
  );
}

export function MemberLink({ member, anonymous = false }: { member: Member; anonymous?: boolean }) {
  if (anonymous) return <span className="text-2" style={{ fontWeight: 600 }}>匿名葡萄</span>;
  return (
    <Link href={`/u/${member.login}`} style={{ color: "var(--text)", fontWeight: 700 }}>
      {member.name}
    </Link>
  );
}

export function BoardChip({ slug, link = false }: { slug: string; link?: boolean }) {
  const board = getBoard(slug);
  if (!board) return null;
  const chip = <span className={`chip tone-${board.tone}`}>{board.name}</span>;
  return link ? <Link href={`/c/${board.slug}`} style={{ textDecoration: "none" }}>{chip}</Link> : chip;
}

export function SolvedChip() {
  return (
    <span className="chip tone-vine">
      <Icon name="check" size={14} />
      已解決
    </span>
  );
}

export function Markdown({ source }: { source: string }) {
  return (
    <div className="prose">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
        {source}
      </ReactMarkdown>
    </div>
  );
}
