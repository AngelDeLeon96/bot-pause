import express from 'express';

const router = express.Router();

// Enviar mensaje a usuario de WhatsApp
const chatWoodHook = async (req, res) => {
    const providerWS = req.providerWS;
    const body = req.body;
    console.log('body', JSON.stringify(body))

    const phone = body?.conversation?.meta?.sender?.phone_number.replace("+", "");
    if (body?.private) {
        res.send(null);
        return;
    }
    console.log('sended to: ', phone, 'msg:', body.content);
    await providerWS.sendMessage(`${phone}`, body.content, {});

    res.send(body);
};

router.post('/chatwood-hook', chatWoodHook);

export default router;