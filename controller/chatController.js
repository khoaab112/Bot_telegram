const dotenv = require('dotenv');
dotenv.config();
const { TOKEN_TELEGRAM, KEY } = process.env;
const TelegramBot = require('node-telegram-bot-api');
const token = TOKEN_TELEGRAM;
const bot = new TelegramBot(token, { polling: true });
const fs = require('fs');
const options = {
    parse_mode: "HTML",
};

function byKeyword() {
    bot.onText(/\/key(.+)/, (msg, match) => {
        console.log(match);
        const chatId = msg.chat.id;
        bot.sendMessage(chatId, "Hãy nhâp từ khóa");

        // if (match[1] == KEY) {
        //     bot.sendMessage(chatId, "Chào chủ nhân");
        // }
    });
    bot.onText(/\/menu/, (msg, match) => {
        const chatId = msg.chat.id;
        let message = "Danh sách lệnh\n"
        message += '<strong>/key\n/menu\n/group_list\n/Google_sheet\n/Note\n/weather\n/girl\n/shop_web\n/avatar_bot\n/avatar_group</strong>\n/clear'
        message += '<i>----------------------</i>\n ';
        message += `🐸🐸🐸`;
        bot.sendMessage(chatId, message, options);
    });


}

function receiveAll() {
    bot.on('message', (msg) => {
        // console.log(msg);

        const chatId = msg.chat.id;

        // send a message to the chat acknowledging receipt of their message
        // bot.sendMessage(chatId, 'Received your message');
    });
}

module.exports = {
    receiveAll,
    byKeyword
}