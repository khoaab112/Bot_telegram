const googleDrive = require("./GoogleDriveController");
const googleSheet = require("./GoogleSheetController");
const method = require("../Helpers/method");
const link = "https://lh3.googleusercontent.com/d/";
const GROUP_FOLDER_PATH = "./assets/doc/groups.json"
const dotenv = require('dotenv');
dotenv.config();
const { TOKEN_TELEGRAM, KEY, ID_USER, ID_GROUP_GOOGLE_SHEET } = process.env;
const TelegramBot = require('node-telegram-bot-api');
const token = TOKEN_TELEGRAM;
const bot = new TelegramBot(token, { polling: true });
const fs = require('fs');
const { type } = require("os");
const options = {
    parse_mode: "HTML",
};
var unfinishedWork = {
    key: "",
    isUnlocked: false,
};
var numberUnlockRequests = 0;
var lastUnlockRequestTime = null;

function byKeyword() {
    bot.onText(/\/key(.+)/, (msg, match) => {
        // console.log(match);
        const chatId = msg.chat.id;
        bot.sendMessage(chatId, "Hãy nhâp từ khóa");

        // if (match[1] == KEY) {
        //     bot.sendMessage(chatId, "Chào chủ nhân");
        // }
    });
    bot.onText(/\/menu/, (msg, match) => {
        const chatId = msg.chat.id;
        let message = "Danh sách lệnh\n";
        message += '<strong>/key\n' +
            '/menu\n' +
            '/group_list\n' +
            '/Google_sheet\n' +
            '/Note\n' +
            '/weather\n' +
            '/girl\n/' +
            'shop_web\n' +
            '/avatar_bot\n' +
            '/avatar_group' +
            '</strong>\n' +
            '/clear\n/' +
            '<strong>folder_google_drive</strong>\n' +
            '<i>/add_group</i>\n' +
            '<i>/remove_group</i>\n';
        message += '<i>----------------------</i>\n ';
        message += `🐸🐸🐸`;

        bot.sendMessage(chatId, message, options);
    });
    bot.onText(/\/group_list/, (msg, match) => {
        const chatId = msg.chat.id;
        if (!allowOperation(chatId, msg.chat.type)) return;
        bot.getChatAdministrators(chatId).then(admins => {
            console.log(admins);
            // const groups = admins
            //     .filter(admin => admin.status === 'administrator')
            //     .map(admin => admin.chat.title);

            // bot.sendMessage(chatId, `Danh sách các nhóm mà bot tham gia: \n${groups.join('\n')}`);
        }).catch(error => {
            console.log('Error:', error);
        });
        // bot.sendMessage(chatId, "Chưa hoạt động !", options);
    });
    bot.onText(/\/Google_sheet/, async(msg, match) => {
        const chatId = msg.chat.id;
        var sheetsName = await googleSheet.listSheets();
        if (sheetsName.length <= 0) {
            bot.sendMessage(chatId, "Không có sheet nào được tìm thấy", options);
            return;
        };
        var lsBtn = [];
        var row_2 = [];
        sheetsName.forEach((element, key) => {
            console.log(element.properties.title);
            lsBtn.push({
                text: element.properties.title,
                callback_data: 'btnSheetMain_' + element.properties.title,
            });
            if (!key % 2 == 0) {
                row_2.push(lsBtn);
                lsBtn = [];
            }
        });
        const inlineKeyboard = { inline_keyboard: row_2 };
        const messageOptions = {
            reply_markup: inlineKeyboard,
            parse_mode: "HTML",
        };
        if (msg.from.id == ID_USER && msg.chat.type == 'private') {
            let message = "Danh sách sheet <strong><i>(Các nút chỉ hoạt động trong nhóm sheet)</i></strong>"
            bot.sendMessage(chatId, message, messageOptions);
            return;
        }
        if (msg.chat.id != ID_GROUP_GOOGLE_SHEET || msg.from.id != ID_USER) return;
        let message = "Danh sách sheet <strong><i>(Chọn sheet để xử dụng các tính năng)</i></strong>"
        bot.sendMessage(chatId, message, messageOptions);
    });
    bot.onText(/\/weather/, (msg, match) => {
        const chatId = msg.chat.id;
        bot.sendMessage(chatId, "Chưa hoạt động !", options);
    });
    bot.onText(/\/girl/, (msg, match) => {
        const chatId = msg.chat.id;
        bot.sendMessage(chatId, "Chưa hoạt động !", options);
    });
    bot.onText(/\/shop_web/, (msg, match) => {
        const chatId = msg.chat.id;
        if (!allowOperation(chatId, msg.chat.type)) return;
        bot.sendMessage(chatId, "Chưa hoạt động !", options);
    });
    bot.onText(/\/avatar_bot/, (msg, match) => {
        const chatId = msg.chat.id;
        if (!allowOperation(chatId, msg.chat.type)) return;
        bot.sendMessage(chatId, "Chưa hoạt động !", options);
    });
    bot.onText(/\/avatar_group/, (msg, match) => {
        const chatId = msg.chat.id;
        bot.sendMessage(chatId, "Chưa hoạt động !", options);
    });
    bot.onText(/\/folder_google_drive/, async(msg, match) => {
        const chatId = msg.chat.id;
        var data = await googleDrive.getListFile()
        console.log(data);
        var iconFolder = "📁";
        var message = "Danh sách thư mục\n"
        var lsBtn = [];
        var row_2 = [];
        data.forEach((element, key) => {
            lsBtn.push({
                text: iconFolder + element.name,
                callback_data: 'btnFolder_' + element.id,
            });
            if (!key % 2 == 0) {
                row_2.push(lsBtn);
                lsBtn = [];
            }
        });
        const inlineKeyboard = { inline_keyboard: row_2 };
        const messageOptions = {
            reply_markup: inlineKeyboard
        };
        bot.sendMessage(chatId, message, messageOptions);
    });
    bot.onText(/\/clear/, (msg, match) => {
        const chatId = msg.chat.id;
        // console.log(chatId);
        const inlineKeyboard = {
            inline_keyboard: [
                [{
                    text: '✔️ Theo lựa chọn',
                    callback_data: 'selective_deletion',
                }, { text: '🗑️ Xóa toàn bộ', callback_data: 'remove_all' }],
            ]
        };
        const messageOptions = {
            reply_markup: inlineKeyboard
        };
        unfinishedWork.key = "1";
        bot.sendMessage(chatId, 'Hãy lựa chọn hành động :', messageOptions);
    });

    // bot.onText(/\/add_group/, async(msg, match) => {
    //     const chatId = msg.chat.id;
    //     if (msg.from.id == ID_USER && msg.chat.type == 'supergroup') {
    //         try {
    //             const dataFile = await method.readFile(GROUP_FOLDER_PATH);
    //             console.log('Nội dung của file:', dataFile);

    //             const dataGroup = { id: msg.chat.id, title: msg.chat.title };
    //             let data;

    //             if (!dataFile || dataFile.length <= 0) {
    //                 data = [dataGroup];
    //             } else {
    //                 data = dataFile;
    //                 data.push(dataGroup);
    //             }

    //             await method.writeFile(JSON.stringify(data), GROUP_FOLDER_PATH);
    //             bot.sendMessage(chatId, "Thêm nhóm vào danh sách thành công !", options);
    //         } catch (error) {
    //             console.error('Đã xảy ra lỗi:', error);
    //             bot.sendMessage(chatId, "Lỗi khi thêm nhóm vào danh sách!", options);
    //         }
    //     }
    // });
    bot.onText(/\/add_group/, async(msg, match) => {
        const chatId = msg.chat.id;
        if (msg.from.id == ID_USER && msg.chat.type == 'supergroup') {

        }
    });
    bot.onText(/\/remove_group/, (msg, match) => {
        const chatId = msg.chat.id;
        bot.sendMessage(chatId, "Chưa hoạt động !", options);
    });
}

function receiveAll() {
    bot.on('message', (msg) => {
        const chatId = msg.chat.id;
        if (Number(numberUnlockRequests) >= 3) {
            unfinishedWork = {
                key: "",
                isUnlocked: false,
            };
            numberUnlockRequests = 0;
            lastUnlockRequestTime = null;
        } else if ((Math.abs(new Date() - lastUnlockRequestTime) / 60000) > 3) {
            unfinishedWork = {
                key: "",
                isUnlocked: false,
            };
            numberUnlockRequests = 0;
            lastUnlockRequestTime = null;

        } else if (unfinishedWork.key != "" && !unfinishedWork.isUnlocked) {
            let code = msg.text;
            bot.deleteMessage(chatId, msg.message_id);
            if (code.trim() == KEY) {
                unfinishedWork.isUnlocked = true;
                fulfillRequest();
                return bot.sendMessage(chatId, "Nhập chính xác", options);
            }
            requestPassword(chatId, unfinishedWork.key)
        }
    });
}

function requestPassword(chatId, key) {
    let message = "<strong>Hãy nhập mật khẩu</strong>\n";
    message += "<i>(Quá 3 lần hãy thao tác từ đầu)</i>"
    unfinishedWork.key = key;
    numberUnlockRequests = numberUnlockRequests + 1;
    lastUnlockRequestTime = new Date();
    return bot.sendMessage(chatId, message, options);
}
bot.on('callback_query', async(callbackQuery) => {
    // console.log(callbackQuery.message.reply_markup.inline_keyboard);
    // console.log(callbackQuery);
    const data = callbackQuery.data;
    const chatId = callbackQuery.message.chat.id;
    const message_id = callbackQuery.message.message_id;
    const indexOfDash = data.indexOf('_');
    // google_sheet
    if (indexOfDash !== -1) {
        childNodeList(data, chatId, message_id);
        return;
    }

    // // mở file 
    // if (indexOfDash !== -1) {
    //     const partBeforeDash = data.substring(0, indexOfDash);
    //     const partAfterDash = data.substring(indexOfDash + 1);
    //     if (partBeforeDash != 'btnFolder') return;
    //     let dataGoogle = await googleDrive.getFolderByID(partAfterDash);
    //     // console.log(dataGoogle);
    //     if (dataGoogle.length <= 0) {
    //         bot.sendMessage(chatId, "Thư mục không có dữ liệu", options);
    //     } else {
    //         let message = [];

    //         dataGoogle.forEach(el => {
    //             if (!method.isImageExtension(el.name)) { return };
    //             message.push({
    //                 type: 'photo',
    //                 media: link + el.id
    //             });
    //         });
    //         bot.sendMediaGroup(chatId, message);
    //     }
    //     return;
    // }
    switch (data) {
        case 'selective_deletion':
            unfinishedWork = {
                key: "",
                isUnlocked: false,
                id_message: message_id,
                chat_id: chatId
            };
            numberUnlockRequests = 0;
            lastUnlockRequestTime = null;
            requestPassword(chatId, 'selective_deletion');
            break;
            // case 'btn_folder':
            //     console.log(callbackQuery.message.reply_markup.inline_keyboard);
            //     // console.log(callbackQuery);
        default:
            break;
    }

});

function fulfillRequest() {
    var key = unfinishedWork.key;
    if (!unfinishedWork.isUnlocked) { return; }
    switch (key) {
        case 'selective_deletion':

            break;
        default:

    }
}

async function childNodeList(data, chat_id, message_id) {
    const indexOfDash = data.indexOf('_');
    const partBeforeDash = data.substring(0, indexOfDash);
    const partAfterDash = data.substring(indexOfDash + 1);
    switch (partBeforeDash) {
        case 'btnSheetMain':
            const inlineKeyboard = {
                inline_keyboard: [
                    [{
                            text: 'Đọc tất cả dữ liệu',
                            callback_data: 'btnSheetChildRead_' + partAfterDash,
                        },
                        {
                            text: 'ghi dữ liệu theo ngày hiện tại',
                            callback_data: 'btnSheetChildWrite_' + partAfterDash,
                        },
                    ],
                    [{
                            text: 'Đọc dữ liệu thao ngày',
                            callback_data: 'btnSheetChildSearchByDay' + partAfterDash,
                        },
                        {
                            text: 'Tính tổng tiền theo ngày',
                            callback_data: 'btnSheetChildSum' + partAfterDash,
                        },
                    ],
                ]
            };
            const messageOptions = {
                reply_markup: inlineKeyboard
            };
            unfinishedWork.key = "1";
            bot.sendMessage(chat_id, 'Hãy lựa chọn hành động cho sheet ' + partAfterDash + ':', messageOptions);
            break;
        case 'btnSheetChildRead':
            var data = await googleSheet.readFromGoogleSheet(partAfterDash);
            var html = "";
            const firstHtml = `<table style="border-collapse: collapse; width: 100%;border="1">    <thead style="border: 2px solid black;background: #e6f4ff;">
<tr>
    <th colspan="1">Ngày</th>
</tr>
</thead>`;
            var firstBody = `<tbody style="border: 2px solid black; "><tr style="text-align: center;">`;
            var conBody = `</tr><tr style="text-align: right;">`;
            var lastBody = ` </tr></tbody>`;
            let bodyHTML = "";
            const lastHtml = `</table>`;
            for (let index in data) {
                let html = '';
                if (data[index].length <= 0) continue;
                if (data[index][0].length <= 0) continue;
                data[index].forEach((el, key) => {
                    console.log(key);
                    if (key == 0) {
                        html += firstBody + `<td rowspan="2">` + el + `</td>`;
                    } else {
                        html += `<td>` + el + `</td>`;
                    }
                });
                html += `<td>Tổng</td>`;
                html += conBody;
                let sumMoney = 0;
                data[Number(index) + 1].forEach((el, key) => {
                    if (el.length <= 0) return;
                    html += `<td style="color: red;font-weight: bold;">` + el + `</td>`;
                    console.log(parseInt(el.replace(/\./g, "")))
                    sumMoney += parseInt(el.replace(/\./g, ""));
                });
                console.log(sumMoney);
                html += `<td style="color: red;font-weight: bold;">` + sumMoney.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ` VND</td>`;
                html += lastBody + lastHtml;
                bodyHTML += html;
            }
            html = firstHtml + bodyHTML + lastHtml;
            console.log(html);
            break;
        case 'btnSheetChildWrite':
            break;
        case 'btnSheetChildSearchByDay':
            break;
        case 'btnSheetChildSum':
            break;
        default:
            break;
    }
}

function allowOperation(chat_id, type_chat) {
    if (chat_id == ID_USER && type_chat == 'private')
        return true;
    return false;
}
module.exports = {
    receiveAll,
    byKeyword,
}