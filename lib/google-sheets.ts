import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'

/**
 * Create Google Sheets client with user's refresh token
 */
export function createSheetsClient(refreshToken: string) {
  const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  )

  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  })

  return google.sheets({ version: 'v4', auth: oauth2Client })
}

/**
 * Get all sheet names from a spreadsheet
 */
export async function getSheetNames(spreadsheetId: string, refreshToken: string) {
  const sheets = createSheetsClient(refreshToken)

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
  sheetName: string,
  refreshToken: string
) {
  const sheets = createSheetsClient(refreshToken)

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
  values: any[],
  refreshToken: string
) {
  const sheets = createSheetsClient(refreshToken)

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
  values: any[],
  refreshToken: string
) {
  const sheets = createSheetsClient(refreshToken)

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
  rowIndex: number,
  refreshToken: string
) {
  const sheets = createSheetsClient(refreshToken)

  const response = await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: `${sheetName}!A${rowIndex}:ZZ${rowIndex}`,
  })

  return response.data
}
