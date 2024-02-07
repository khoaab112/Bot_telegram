require('dotenv').config();
const { google } = require('googleapis');
const CLIENT_ID = process.env.GOOGLE_DRIVE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_DRIVE_REDIRECT_URI;
const REFRESH_TOKEN = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;
const ID_GOOGLE_SHEET = process.env.ID_GOOGLE_SHEET;

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });


// const sheets = google.sheets({ version: 'v4', auth });
const sheets = google.sheets({
    version: 'v4',
    auth: oauth2Client
})
async function listSheets() {
    try {
        const response = await sheets.spreadsheets.get({
            spreadsheetId: ID_GOOGLE_SHEET,
            fields: 'sheets(properties(title))', // Lấy tiêu đề của mỗi sheet
        });
        const sheetList = response.data.sheets;
        return sheetList;
    } catch (err) {
        console.error('The API returned an error:', err);
    }
}
async function readFromGoogleSheet() {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: ID_GOOGLE_SHEET,
            range: 'log_thu_chi!A1:B10', // Thay đổi Sheet1 và phạm vi theo ý của bạn
        });

        const rows = response.data.values;
        return rows;
    } catch (err) {
        console.error('The API returned an error:', err);
        return [];
    }
}
module.exports = {
    readFromGoogleSheet,
    listSheets
}