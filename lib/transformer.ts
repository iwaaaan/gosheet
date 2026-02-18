/**
 * Transform Google Sheets rows to JSON format
 * Converts array of arrays to objects with headers as keys
 */
export function transformRowsToJSON(rows: any[][], sheetName: string) {
  if (!rows || rows.length === 0) {
    return { [sheetName]: [] }
  }

  // First row contains headers
  const headers = rows[0].map(h => h?.toString().trim() || '')

  // Transform remaining rows to objects
  const data = rows.slice(1).map((row, index) => {
    const obj: any = {
      id: index + 2  // ID starts at 2 (row 1 is headers)
    }

    headers.forEach((header, i) => {
      let value = row[i]

      // Convert numeric strings to numbers
      if (value !== undefined && value !== null && value !== '') {
        const numValue = Number(value)
        if (!isNaN(numValue) && value.toString().trim() !== '') {
          value = numValue
        }
      }

      obj[header] = value ?? ''
    })

    return obj
  })

  return { [sheetName]: data }
}

/**
 * Transform JSON object to row array for appending to sheet
 */
export function transformJSONToRow(data: Record<string, any>, headers: string[]): any[] {
  return headers.map(header => {
    const value = data[header]
    return value !== undefined && value !== null ? value : ''
  })
}

/**
 * Find row index by ID
 */
export function findRowIndexById(id: number): number {
  // ID corresponds to row number in sheet (starting from 2 for data rows)
  return id - 1  // Array index (subtract 1 because headers are removed)
}
