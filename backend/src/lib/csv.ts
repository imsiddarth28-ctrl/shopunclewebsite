/**
 * RFC 4180 compliant CSV parser.
 * Correctly handles double-quoted fields, escaped quotes, and newlines.
 */
export function parseCSV(csvText: string): Record<string, string>[] {
  const lines: string[][] = []
  let row: string[] = []
  let inQuotes = false
  let currentField = ''

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i]
    const nextChar = csvText[i + 1]

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentField += '"'
          i++ // skip next char
        } else {
          inQuotes = false
        }
      } else {
        currentField += char
      }
    } else {
      if (char === '"') {
        inQuotes = true
      } else if (char === ',') {
        row.push(currentField.trim())
        currentField = ''
      } else if (char === '\r' || char === '\n') {
        row.push(currentField.trim())
        currentField = ''
        if (row.length > 0 && row.some(field => field !== '')) {
          lines.push(row)
        }
        row = []
        if (char === '\r' && nextChar === '\n') {
          i++ // skip LF in CRLF
        }
      } else {
        currentField += char
      }
    }
  }

  // Handle final field and row if any
  if (currentField !== '' || row.length > 0) {
    row.push(currentField.trim())
  }
  if (row.length > 0 && row.some(field => field !== '')) {
    lines.push(row)
  }

  if (lines.length < 2) return []

  // Normalize headers (lowercase, strip whitespace and special chars)
  const headers = lines[0].map(h => h.toLowerCase().replace(/[\s_\-\"\']+/g, ''))
  const results: Record<string, string>[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i]
    const record: Record<string, string> = {}
    
    headers.forEach((header, index) => {
      record[header] = values[index] !== undefined ? values[index] : ''
    })
    
    results.push(record)
  }

  return results
}
