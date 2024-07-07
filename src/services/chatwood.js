
const SERVER = process.env.SERVER || "http://localhost:3000";
const ACCOUNT_ID = process.env.ACCOUNT_ID ?? 1
const INBOX_ID = process.env.INBOX_ID ?? 2
const API = 'dgJT4W4a1LvzuKLgwVvX2muD'

const sendMessageChatwood = async (msg = "", message_type = "incoming", conversation_id = 0) => {
    try {
        const myHeaders = new Headers();
        myHeaders.append("api_access_token", API);
        myHeaders.append("Content-Type", "application/json");
        const raw = JSON.stringify({
            content: (msg instanceof Array) ? msg.join("\n") : msg,
            message_type: message_type, // "incoming", 
            private: true,
            content_type: "input_email",
            content_attributes: {}
        });
        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
        };
        console.log(raw);
        const dataRaw = await fetch(`${SERVER}/api/v1/accounts/${ACCOUNT_ID}/conversations/${conversation_id}/messages`, requestOptions);
        const data = await dataRaw.json();
        return data;
    } catch (err) {
        console.log(err)
        return null
        //console.error(err);
    }
};

export default sendMessageChatwood;