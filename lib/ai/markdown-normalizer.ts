/**
 * Markdown Normalizer & Cleaner
 * Fixes common LLM output and rich-editor formatting artifacts:
 * 1. Malformed Headings (**### Heading**, **### Heading, ### **Heading**, etc.)
 * 2. Reconstructs collapsed or unfenced folder trees (├──, └──, │) into pristine monospace code blocks
 * 3. Normalizes whitespace and unescaped entity artifacts
 */

/**
 * Fixes malformed Markdown headings where bold asterisks wrap heading hash symbols
 */
export function normalizeHeadings(md: string): string {
  if (!md) return "";
  let res = md;

  // Fix: **### 6.3 Heading or **### 6.3 Heading**
  res = res.replace(/^(\s*)\*\*+(#{1,6}\s+[^\n*]+?)(?:\*\*+)?\s*$/gm, "$1$2");

  // Fix: ### **6.3 Heading** or ### **6.3 Heading
  res = res.replace(/^(\s*#{1,6}\s+)\*\*+([^\n*]+?)(?:\*\*+)?\s*$/gm, "$1$2");

  // Fix: Trailing ** on headings (e.g. ### 6.3 Heading**)
  res = res.replace(/^(#{1,6}\s+[^\n*]+?)\*\*+\s*$/gm, "$1");

  // Fix: Standalone pseudo-headings like **6.3 Struktur folder** (numbered sub-sections)
  res = res.replace(/^(\s*)\*\*+(\d+\.(?:\d+)*\s+[^\n*]+?)\*\*+\s*$/gm, "$1### $2");

  return res;
}

/**
 * Reconstructs a single collapsed directory tree line into a multi-line vertical tree
 */
export function reconstructCollapsedTreeLine(line: string): string {
  let root = "";
  let rest = line.trim();

  // Extract root folder if exists: e.g. "app/" or "src/" or "project/"
  const rootMatch = rest.match(/^([a-zA-Z0-9_\-\.\/]+\/)\s*(.*)$/);
  if (rootMatch && (rootMatch[2].includes("├──") || rootMatch[2].includes("└──") || rootMatch[2].includes("├─") || rootMatch[2].includes("└─"))) {
    root = rootMatch[1];
    rest = rootMatch[2];
  }

  // Tokenize by branch tokens (├──, └──, ├─, └─) with leading pipes
  const pattern = /((?:(?:\||│)\s*)*(?:├──|└──|├─|└─)\s*[^|│\n]+?)(?=\s*(?:(?:\||│)\s*)*(?:├──|└──|├─|└─)|$)/g;
  const matches = [...rest.matchAll(pattern)];

  if (matches.length === 0) {
    return line;
  }

  const result: string[] = [];
  if (root) result.push(root);

  for (const m of matches) {
    const raw = m[1].trim();
    // Count pipe levels at the start: e.g. "| | ├──" or "│ │ ├──"
    const pipeMatch = raw.match(/^((?:(?:\||│)\s*)+)(.*)$/);
    if (pipeMatch) {
      const pipes = (pipeMatch[1].match(/\||│/g) || []).length;
      const branchContent = pipeMatch[2].trim();
      result.push("│   ".repeat(pipes) + branchContent);
    } else {
      result.push(raw);
    }
  }

  return result.join("\n");
}

/**
 * Auto-detects directory tree blocks outside fenced code blocks and encapsulates them in ```text ... ```
 */
export function normalizeDirectoryTrees(md: string): string {
  if (!md) return "";

  // Split markdown by code blocks so we never alter content inside existing code fences
  const parts = md.split(/(```[\s\S]*?```)/g);

  for (let i = 0; i < parts.length; i += 2) {
    let part = parts[i];
    if (!part) continue;

    // 1. Process collapsed single-line tree blobs (containing 2 or more tree branch tokens)
    const lines = part.split("\n");
    const newLines: string[] = [];

    for (let j = 0; j < lines.length; j++) {
      const line = lines[j];
      const treeTokenCount = (line.match(/├──|└──|├─|└─/g) || []).length;

      if (treeTokenCount >= 2) {
        const reconstructed = reconstructCollapsedTreeLine(line);
        newLines.push(...reconstructed.split("\n"));
      } else {
        newLines.push(line);
      }
    }

    part = newLines.join("\n");

    // 2. Wrap multi-line tree blocks outside code fences into ```text code blocks
    part = part.replace(
      /(?:^|\n)((?:[ \t]*(?:[a-zA-Z0-9_\-\.\/]+\/|│|├──|└──|├─|└─|\+--|\\--).*(?:\r?\n|$)){3,})/g,
      (match, block) => {
        if (block.includes("```")) return match;
        if (!block.includes("├──") && !block.includes("└──") && !block.includes("├─") && !block.includes("└─")) {
          return match;
        }
        return "\n\n```text\n" + block.trim() + "\n```\n\n";
      }
    );

    parts[i] = part;
  }

  return parts.join("");
}

/**
 * Complete Markdown Normalization Pipeline
 */
export function normalizeMarkdown(md: string): string {
  if (!md) return "";
  let text = md;

  // 1. Clean malformed headings
  text = normalizeHeadings(text);

  // 2. Reconstruct and fence directory trees
  text = normalizeDirectoryTrees(text);

  // 3. Remove excessive triple+ newlines
  text = text.replace(/\n{4,}/g, "\n\n\n");

  return text;
}
