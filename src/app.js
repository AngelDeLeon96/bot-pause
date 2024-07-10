import { createBot, createProvider, createFlow, addKeyword, utils } from '@builderbot/bot'
import { MemoryDB as Database } from '@builderbot/bot'
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'
import { numberClean } from './utils/utils.js'

const PORT = process.env.PORT ?? 3008
const ADMIN_NUMBER = process.env.ADMIN_NUMBER ?? '50764681728'
console.log(ADMIN_NUMBER)

const blackListFlow = addKeyword('mute')
    .addAction(async (ctx, { blacklist, flowDynamic }) => {

        const toMute = ctx.from.replace('+', '') //Mute +34000000 message incoming
        const check = blacklist.checkIf(toMute)
        console.log('muted', check, ctx.body, toMute)
        if (!check) {
            blacklist.add(toMute)
            await flowDynamic(`❌ ${toMute} muted`)
            return
        }
        blacklist.remove(toMute)
        await flowDynamic(`🆗 ${toMute} unmuted`)
        return

    })

const fullSamplesFlow = addKeyword(['samples', utils.setEvent('SAMPLES')])
    .addAction(async (ctx, { blacklist }) => {
        const toMute = ctx.from.replace('+', '')
        const check = blacklist.checkIf(toMute)
        console.log('muted', check, ctx.from)
    })
    .addAnswer(`💪 I'll send you a lot files...`)

const main = async () => {
    const adapterFlow = createFlow([fullSamplesFlow, blackListFlow])

    const adapterProvider = createProvider(Provider)
    const adapterDB = new Database()

    const { httpServer } = await createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    httpServer(+PORT)
}

main()
