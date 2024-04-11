import { Chat, Client, Message } from "whatsapp-web.js";

export abstract class Command {    

    abstract command: string;
    
    usageDescription?: string | string[];

    async isUsageValid(chat: Chat, msg: Message, ...argsArray: string[]): Promise<boolean> {        
        return this.isValid(chat, msg, ...argsArray);
    }

    protected async isValid(chat: Chat, msg: Message, ...argsArray: string[]): Promise<boolean> {
        return true;
    }

    async handle(client: Client, chat: Chat, msg: Message, ...[command, ...argsArray]: string[]): Promise<void> {}

    get usage(): string { 
        return `${this.command} ${this.usageDescription}`
    }
}
