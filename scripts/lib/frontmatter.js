// The leading --- block of a Markdown or MDX file, as simple `key: value` lines. Strings may be
// quoted; true, false, and numbers are converted. Returns null when there's no closed block.
export function frontmatter(text) {
  const block = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!block) return null;
  const data = {};
  for (const line of block[1].split(/\r?\n/)) {
    const m = line.match(/^(\w+):\s*(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if (/^(["']).*\1$/.test(v)) v = v.slice(1, -1);
    else if (v === 'true' || v === 'false') v = v === 'true';
    else if (v !== '' && !Number.isNaN(Number(v))) v = Number(v);
    data[m[1]] = v;
  }
  return data;
}
