import { createBot, createProvider, createFlow, addKeyword, utils } from '@builderbot/bot'
import { MemoryDB as Database } from '@builderbot/bot'
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'
import { EVENTS } from '@builderbot/bot'
import Queue from 'queue-promise';
import { reactivarBot } from './utils/timer.js'
const queue = new Queue({
    concurrent: 1,
    interval: 500
})

const PORT = process.env.PORT ?? 3008
const ADMIN_NUMBER = process.env.ADMIN_NUMBER ?? '50764681728'
console.log(ADMIN_NUMBER)

const blackListFlow = addKeyword(EVENTS.ACTION)
    .addAction(async (ctx, { gotoFlow, blacklist }) => {
        reactivarBot(ctx, gotoFlow, blacklist, 10000)
    })
    .addAction(async (ctx, { blacklist, flowDynamic }) => {
        const toMute = ctx.from.replace('+', '') //Mute +34000000 message incoming
        const check = blacklist.checkIf(toMute)
        console.log('muted', check, ctx.body, toMute)
        if (!check) {
            blacklist.add(toMute)
            await flowDynamic(`modo libre activado`)
            return
        }
        blacklist.remove(toMute)
        await flowDynamic(`🆗 modo libro desactivado`)
        return

    })

const final = addKeyword(EVENTS.ACTION)
    .addAnswer('Adios')

const fullSamplesFlow = addKeyword(EVENTS.WELCOME)
    .addAction(async (ctx, { blacklist }) => {
        const toMute = ctx.from.replace('+', '')
        const check = blacklist.checkIf(toMute)
        console.log('muted', check, ctx.from)
    })
    .addAnswer([`desea hablar con un agente`, `si o no`], { capture: true }, async (ctx, { state, gotoFlow }) => {
        //console.log(ctx)
        await state.update({ check: ctx.body })
        if (state.get('check') == 'si' || state.get('check') == 'sí') {
            return gotoFlow(blackListFlow)
        }
        else {
            return gotoFlow(final)
        }
    }
    )


const main = async () => {
    const adapterFlow = createFlow([fullSamplesFlow, blackListFlow, final])

    const adapterProvider = createProvider(Provider)
    const adapterDB = new Database()

    const bot = await createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    bot.httpServer(+PORT)
    adapterProvider.on('message', (payload) => {
        try {
            queue.enqueue(async () => {
                console.log('bot===', bot.dynamicBlacklist.checkIf(payload.from))
                if (bot.dynamicBlacklist.checkIf(payload.from)) {
                    console.log(payload.body, payload.from);
                }

            })
        }
        catch (err) {
            console.log(err)
        }

    })

}

main()
