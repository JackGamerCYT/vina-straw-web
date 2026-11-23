/** Hiển thị nội dung bài viết: đoạn trống tách đoạn, "## " là tiêu đề, "- " là gạch đầu dòng. */
export function PostBody({ body }: { body: string }) {
  const blocks = body.replace(/\r/g, "").split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className="space-y-5 text-[17px] leading-[1.8] text-ink/90">
      {blocks.map((b, i) => {
        if (b.startsWith("## ")) return <h2 key={i} className="font-display pt-4 text-2xl font-bold text-leaf-900">{b.slice(3)}</h2>;
        if (b.startsWith("### ")) return <h3 key={i} className="font-display pt-2 text-xl font-bold text-leaf-900">{b.slice(4)}</h3>;
        const lines = b.split("\n");
        if (lines.every((l) => l.startsWith("- "))) return <ul key={i} className="list-disc space-y-1.5 pl-6 marker:text-sprout">{lines.map((l, k) => <li key={k}>{l.slice(2)}</li>)}</ul>;
        return <p key={i} className="whitespace-pre-line">{b}</p>;
      })}
    </div>
  );
}
