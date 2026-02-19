import { google } from 'googleapis'

/**
 * Create Google Sheets client with Service Account
 */
export function createSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: './google-service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth })
}

/**
 * Get all sheet names from a spreadsheet
 */
export async function getSheetNames(spreadsheetId: string) {
  const sheets = createSheetsClient()

  const response = await sheets.spreadsheets.get({
    spreadsheetId,
  })

  return response.data.sheets?.map(sheet => sheet.properties?.title || '') || []
}

/**
 * Read data from a specific sheet
 */
export async function readSheet(
  spreadsheetId: string,
  sheetName: string
) {
  const sheets = createSheetsClient()

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A:ZZ`,  // Read all columns
  })

  return response.data.values || []
}

/**
 * Append row to sheet
 */
export async function appendToSheet(
  spreadsheetId: string,
  sheetName: string,
  values: any[]
) {
  const sheets = createSheetsClient()

  const response = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A:ZZ`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [values],
    },
  })

  return response.data
}

/**
 * Update specific row in sheet
 */
export async function updateRow(
  spreadsheetId: string,
  sheetName: string,
  rowIndex: number,
  values: any[]
) {
  const sheets = createSheetsClient()

  const response = await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetName}!A${rowIndex}:ZZ${rowIndex}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [values],
    },
  })

  return response.data
}

/**
 * Delete row from sheet (by clearing values)
 */
export async function deleteRow(
  spreadsheetId: string,
  sheetName: string,
  rowIndex: number
) {
  const sheets = createSheetsClient()

  const response = await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: `${sheetName}!A${rowIndex}:ZZ${rowIndex}`,
  })

  return response.data
}
