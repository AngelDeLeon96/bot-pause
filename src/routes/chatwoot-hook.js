import express from 'express';

const router = express.Router();

// Enviar mensaje a usuario de WhatsApp
const chatWoodHook = async (req, res) => {
    try {
        const providerWS = req.providerWS;
        const body = req.body;
        console.log('22body', JSON.stringify(body), "\n")
        const phone = body?.conversation?.meta?.sender?.phone_number.replace("+", "") ? body?.conversation?.meta?.sender?.phone_number : false
        //const phone = body?.conversation?.meta?.sender?.phone_number.replace("+", "");

        if (body?.private) {
            res.send(null);
            return;
        }
        console.log('phone ', phone)
        if (phone != false) {
            console.log('sended to: ', phone, 'msg:', body.content);
            await providerWS.sendMessage(`${phone}`, body.content, {});
        }


        res.send(body);
    }
    catch (err) {
        console.error(err)
    }

};

router.post('/chatwood-hook', chatWoodHook);

export default router;