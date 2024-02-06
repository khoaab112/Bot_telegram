const fs = require('fs');
const { promisify } = require('util');
const isImageExtension = (text) => {
    const regex = /\.(jpg|jpeg|png|gif|bmp)$/i;
    return regex.test(text);
};
//ghi đè
const writeFile = (text, path, callback) => {
    fs.writeFile(path, text, (err) => {
        if (err) {
            callback(err); // Gọi callback với lỗi nếu có
        }
        yield
    });
};
//nối file
const appendFile = (text, path) => {
    try {
        fs.appendFile(path, text, (err) => {
            if (err) { throw err; };
        });
        return true;
    } catch (err) { throw err };
};



const readFile = (path) => {
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf8', (err, data) => {
            if (err) {
                reject(err); // Trả về lỗi nếu có lỗi khi đọc file
                return;
            }

            resolve(JSON.parse(data.trim())); // Trả về dữ liệu đọc được từ file
        });
    });
};
module.exports = {
    isImageExtension,
    appendFile,
    readFile,
    writeFile,
}