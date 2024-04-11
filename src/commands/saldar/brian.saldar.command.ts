import { Chat, Client, Message } from "whatsapp-web.js";
import { Command } from "../command.js";

export class BrianSaldarCommand extends Command {

    command: string = "/diga-oi";
    
    description: string = "Brian dirá linda mensagem de bom dia";

    async handle(client: Client, chat: Chat, msg: Message, ...[command, ...argsArray]: string[]): Promise<void> {
        await  msg.reply(`Tubarão te AMO!!`) 
    }
}