require('dotenv').config();

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const CLIENT_ID = process.env.GOOGLE_DRIVE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_DRIVE_REDIRECT_URI;
const REFRESH_TOKEN = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;
const FOLDER = process.env.GOOGLE_DRIVE_FOLDER;


const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({
    version: 'v3',
    auth: oauth2Client
})


async function getFolderByID(id) {
    try {
        const a = await drive.files.list({
            pageSize: 10, // Số lượng tệp tin bạn muốn lấy
            fields: 'files(id, name)', // Chỉ lấy id và name của mỗi tệp
            q: `'${id}' in parents`,
        })
        return a.data.files;
    } catch (error) {
        return (error);
    }
};

async function setFilePublic(fileId) {
    try {
        await drive.permissions.create({
            fileId,
            requestBody: {
                role: 'reader',
                type: 'anyone'
            }
        })

        const getUrl = await drive.files.get({
            fileId,
            fields: 'webViewLink, webContentLink'
        })

        return getUrl;
    } catch (error) {
        console.error(error);
    }
};

async function uploadFile(shared) {
    try {
        const createFile = await drive.files.create({
            requestBody: {
                name: "iloveyou_cr7.jpg",
                mimeType: 'image/jpg'
            },
            media: {
                mimeType: 'image/jpg',
                body: fs.createReadStream(path.join(__dirname, '/../cr7.jpg'))
            }
        })
        const fileId = createFile.data.id;
        console.log(createFile.data)
        const getUrl = await that.setFilePublic(fileId);

        console.log(getUrl.data);

    } catch (error) {
        console.error(error);
    }
};

async function deleteFile(fileId) {
    try {
        console.log('Delete File:::', fileId);
        const deleteFile = await drive.files.delete({
            fileId: fileId
        })
        console.log(deleteFile.data, deleteFile.status)
    } catch (error) {
        console.error(error);
    }
};

async function getListFile() {
    try {
        const list = await drive.files.list({
            pageSize: 10, // Số lượng tệp tin bạn muốn lấy
            fields: 'files(id, name)', // Chỉ lấy id và name của mỗi tệp
            q: `name='${FOLDER}'`,
        })
        const folder = await getFolderByID(list.data.files[0].id);
        return folder;
    } catch (error) {
        console.log(error);
        return (error);
    }
};

module.exports = {
    getListFile,
    getFolderByID
}