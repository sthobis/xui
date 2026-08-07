/**
 * Removes comments from TypeScript source, for the copy-ready view of the theme in ThemePanel.
 *
 * A regex would be wrong here: the theme is dense with `//` inside template literals (every
 * `color-mix(...)` value is followed by a `// shadcn:` provenance comment on the same line) and it
 * contains a real regex literal, so this walks the source one character at a time and tracks which
 * of those it is currently inside. The regex-literal case uses the usual heuristic - a `/` opens a
 * regex only where an operand cannot appear - which is enough for a file that has exactly one.
 */
export function stripComments(source: string): string {
  let out = ""
  let i = 0
  // The last significant character emitted, used to decide whether a `/` starts a regex literal.
  let lastSignificant = ""

  const regexCanStartAfter = new Set(["", "(", ",", "=", ":", "[", "!", "&", "|", "?", "{", "}", ";", "+", "-", "*", "%", "<", ">", "~", "^"])

  while (i < source.length) {
    const ch = source[i]
    const next = source[i + 1]

    if (ch === "/" && next === "/") {
      while (i < source.length && source[i] !== "\n") i++
      continue
    }
    if (ch === "/" && next === "*") {
      i += 2
      while (i < source.length && !(source[i] === "*" && source[i + 1] === "/")) i++
      i += 2
      continue
    }
    if (ch === '"' || ch === "'") {
      const quote = ch
      out += ch
      i++
      while (i < source.length) {
        out += source[i]
        if (source[i] === "\\") {
          out += source[i + 1] ?? ""
          i += 2
          continue
        }
        if (source[i] === quote) {
          i++
          break
        }
        i++
      }
      lastSignificant = quote
      continue
    }
    if (ch === "`") {
      // Template literals nest: `${ ... }` can contain more strings, and in this file it always
      // contains member expressions rather than further templates, but the depth counter keeps it
      // correct either way.
      out += ch
      i++
      let depth = 0
      while (i < source.length) {
        if (source[i] === "\\") {
          out += source[i] + (source[i + 1] ?? "")
          i += 2
          continue
        }
        if (source[i] === "$" && source[i + 1] === "{") {
          depth++
          out += "${"
          i += 2
          continue
        }
        if (source[i] === "}" && depth > 0) {
          depth--
          out += "}"
          i++
          continue
        }
        if (source[i] === "`" && depth === 0) {
          out += "`"
          i++
          break
        }
        out += source[i]
        i++
      }
      lastSignificant = "`"
      continue
    }
    if (ch === "/" && regexCanStartAfter.has(lastSignificant)) {
      out += ch
      i++
      let inClass = false
      while (i < source.length) {
        if (source[i] === "\\") {
          out += source[i] + (source[i + 1] ?? "")
          i += 2
          continue
        }
        if (source[i] === "[") inClass = true
        else if (source[i] === "]") inClass = false
        else if (source[i] === "/" && !inClass) {
          out += "/"
          i++
          break
        }
        out += source[i]
        i++
      }
      lastSignificant = "/"
      continue
    }

    out += ch
    if (ch.trim() !== "") lastSignificant = ch
    i++
  }

  return tidy(out)
}

/**
 * Comment removal leaves behind trailing spaces and long runs of blank lines where banner blocks
 * used to be. This collapses them so the result reads like a file someone wrote, not a file
 * something processed.
 */
function tidy(source: string): string {
  return source
    .split("\n")
    .map((line) => line.replace(/\s+$/, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/([{[(])\n\n/g, "$1\n")
    .replace(/\n\n(\s*[}\])])/g, "\n$1")
    .trim()
    .concat("\n")
}
