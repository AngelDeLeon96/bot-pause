import { createBot, createProvider, createFlow, addKeyword, utils } from '@builderbot/bot'
import { MemoryDB as Database } from '@builderbot/bot'
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'
import { reactivarBot } from './utils/timer.js'
import controlBot from './utils/status.js'
import { EVENTS } from '@builderbot/bot'
import ServerHttp from './http/server.js'
const PORT = process.env.PORT ?? 3008

const goodBye = addKeyword(EVENTS.ACTION).addAnswer('BYE')

const talkToAgent = addKeyword('talk')
    //.addAction(async (ctx, { gotoFlow }) => reactivarBot(ctx, gotoFlow))
    .addAnswer(`desea hablar con un agente?\n Si, No`, { capture: true }, async (ctx, { state }) => {
        await state.update({ res: ctx.body })
    })
    .addAction(async (_, { flowDynamic, state, gotoFlow }) => {
        //await provider.sendTet(agent, `El usuario X con numero ${ctx.from} quiere hablar con un agente.`)
        console.log(state.get('res'))
        if (state.get('res').toLowerCase() == 'si') {
            //await flowDynamic('Un agente se poindra en contacto.')
            return gotoFlow(agentFlow)
        }
        else {
            return gotoFlow(goodBye)
        }
    })

const agentFlow = addKeyword('agente')
    .addAction(async (ctx, { flowDynamic, provider }) => {
        controlBot.status = false;
        await flowDynamic('Modo libre...')
        console.log('bot status: ', controlBot)
        const id = ctx.key.remoteJid
        const name = ctx.name
        const agent = id
        console.log('Activado modo libre', name)
    })

const activeBot = addKeyword('bot')
    .addAction(async (ctx, { flowDynamic, provider }) => {
        controlBot.status = true
    })

const flow = addKeyword('hello')
    .addAnswer(`What is your name?`, { capture: true }, async (ctx, { state }) => {
        await state.update({ name: ctx.body })
    })
    .addAction(async (ctx, { state, flowDynamic, gotoFlow }) => {
        const name = state.get('name')
        await flowDynamic(`Your name is: ${name}`)
    })
    .addAction(async (_, { gotoFlow }) => {
        return gotoFlow(talkToAgent)
    })


const welcomeFlow = addKeyword(['hi', 'hello', 'hola'])
    .addAnswer('🙌')
    .addAction(async (ctx, { endFlow, gotoFlow }) => {
        console.log(controlBot)
        if (controlBot.status == false)
            return endFlow()
        return gotoFlow(flow)
    }).addAnswer('BIEnvenido')




const main = async () => {
    const adapterFlow = createFlow([welcomeFlow, agentFlow, activeBot, flow, talkToAgent, goodBye])
    const adapterProvider = createProvider(Provider)
    const adapterDB = new Database()
    const bot = await createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })



    bot.httpServer(+PORT)
    const server = new ServerHttp(adapterProvider)
    server.start()

    adapterProvider.on('message', ({ body, from }) => {
        //bot desactivado
        if (controlBot.status == false) {
            //sendMessage('body')
            //se los mensajes wb se siguen recibiendo, pero en el CRM no, por ende se deben enviar al CRM, tambien
            console.log(`Message Payload:`, { body, from })
        }
    })

    bot.on('send_message', ({ answer, from }) => {
        console.log(`Send Message Payload:`, { answer, from })
    })

    adapterProvider.on('messages.upsert', async (msg) => {
        const message = msg.messages[0]
        if (!message.key.fromMe) {
            console.log('Mensaje recibido:', message)
            await adapterProvider.sendMessage(message.key.remoteJid, { text: 'Hola! Recibí tu mensaje.' })
        }
    })

    adapterProvider.on('messages.upsert', async ({ messages, type }) => {
        if (type === 'notify') {
            for (const msg of messages) {
                const message = msg.messages[0];
                if (!message.key.fromMe) {
                    console.log('Nuevo mensaje recibido: ', message);
                } else {
                    console.log('Mensaje enviado por el agente: ', message);
                }
            }
        }
    });

    adapterProvider.on('message-update', async (msg) => {
        console.log('Mensaje actualizado o enviado: ', msg);
    });

}

main()
