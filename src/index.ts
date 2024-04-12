import * as qrcode from 'qrcode-terminal';

import { Client, LocalAuth, Message } from 'whatsapp-web.js';

import { Command } from './commands/command';
import { Constructor } from './utils/constructor';

import { BrianSaldarCommand } from './commands/saldar/brian.saldar.command';
import { SelicCommand } from './commands/selic/selict.command';

const config = {
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox'],
    }
}

const USE_WEB_CACHE_VERSION = "2.2409.2"
if (USE_WEB_CACHE_VERSION) {
    console.log("Using web cache version ", USE_WEB_CACHE_VERSION)
    config['webVersionCache'] = {
        type: 'remote',
        remotePath: `https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/${USE_WEB_CACHE_VERSION}.html`,
    }
}

const client = new Client(config);

client.on('auth_failure', console.log)
client.on('loading_screen', console.log)

client.on('qr', (qr) => {   
    console.log('QR RECEIVED', qr);
    qrcode.generate(qr, { small: true });
});


client.on('authenticated', async () => {
    console.log('Client is ready!');
    console.log(`WhatsApp Web v${await client.getWWebVersion()}`);
    console.log(`WWebJS v${require('whatsapp-web.js').version}`);

    handlers.forEach((handlerConstructor) => {
        const handler = new handlerConstructor();
        registerCommand(handler.command, handler, RegisteredHandlers);        
    });
    
    console.info(`
    Available commands:\n
    ${Object.keys(RegisteredHandlers).join("\n")}`)
});

const handlers: Constructor<Command>[] = [
    BrianSaldarCommand,
    SelicCommand
]
const registerCommand = (command: string, handler: Command, handlers: CommandMap) => {    
    if (handlers[command]) {
        console.error(`Já existe um handler para o comando ${command}`)
    } else {
        console.info(`Registrando comando ${command}`)
        handlers[command] = handler;
    }
}

type CommandMap = {
    [key: string]: Command;
};

const RegisteredHandlers: CommandMap = {}

const handleMessage = async (msg: Message) => {

    const chat = await msg.getChat();

    if (msg.isStatus) { return; }

    console.info(`Received message from ${msg['_data'].notifyName} at ${chat.name}: `);    

    if (typeof msg.body === 'string') {

        const [command, ...argsArray] = msg.body.split(" ");
        const handler = RegisteredHandlers[command]
        if (handler) {
            console.info(`Message contains a registered command ${command}`); 
            if (await handler.isUsageValid(chat, msg, ...argsArray)) {
                try {
                    console.info(`Calling handler for ${command}`);
                    await handler.handle(client, chat, msg, ...argsArray);
                } catch (e) {
                    console.error(`Erro ao processar comando ${command}`)
                    console.error(e);
                }
            } else {
                await msg.reply("Comando Inválido! Modo de uso:\n\n" + handler.usage)
            }          
        }        
    }
}

client.on('message_create', handleMessage);

client.initialize();