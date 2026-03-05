export function parseCssRules(styleText: string): { byClass: Map<string, string>; byTag: Map<string, string> } {
  const byClass = new Map<string, string>();
  const byTag = new Map<string, string>();
  if (!styleText) return { byClass, byTag };

  const css = styleText
    .replace(/<!--/g, "")
    .replace(/-->/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");

  const ruleRe = /([^{]+)\{([^}]*)\}/g;
  let m;
  while ((m = ruleRe.exec(css))) {
    const selector = m[1].trim();
    const decls = normDecl(m[2]);

    selector
      .split(",")
      .map((s) => s.trim())
      .forEach((sel) => {
        if (!sel) return;
        if (sel.startsWith(".")) byClass.set(sel.slice(1), decls);
        else if (/^[a-z]+$/i.test(sel)) byTag.set(sel.toLowerCase(), decls);
      });
  }
  return { byClass, byTag };
}

function normDecl(s: string): string {
  return s
    .split(";")
    .map((x) => x.trim())
    .filter(Boolean)
    .map((kv) => {
      const i = kv.indexOf(":");
      if (i < 0) return "";
      const k = kv.slice(0, i).trim().toLowerCase();
      const v = kv.slice(i + 1).trim();
      return `${k}: ${v}`;
    })
    .filter(Boolean)
    .join("; ");
}

export function mergeStyles(...styles: (string | undefined | null)[]): string {
  const map = new Map<string, string>();
  styles
    .filter(Boolean)
    .join("; ")
    .split(";")
    .forEach((pair) => {
      const s = pair.trim();
      if (!s) return;
      const i = s.indexOf(":");
      if (i < 0) return;
      const k = s.slice(0, i).trim().toLowerCase();
      const v = s.slice(i + 1).trim();
      if (!k) return;
      map.set(k, v);
    });
  return Array.from(map.entries())
    .map(([k, v]) => `${k}: ${v}`)
    .join("; ");
}

export function cleanExcelText(text: string): string {
  return (text || "").replace(/\u00A0/g, " ").trim();
}
