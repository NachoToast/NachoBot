import mongoose from 'mongoose';
import fs from 'fs';
import { Rcon } from 'rcon-client';
import { modules } from '../../config.json';

const { host, port, password, retryConnectionOnFail, checkInterval } = modules.minecraft.rcon;

export interface RconInstance {
    connected: boolean;
    rcon: Rcon;
}

class MinecraftServer {
    private connected = false;
    private previouslyConnected = false;
    private instance: Rcon;
    private logFile = 'logs/rcon.log';
    private attempts = 0;

    constructor() {
        this.log('Instantiating module...', true);
        this.connectDB();
        this.instance = new Rcon({ host, port, password });
        this.attemptConnection();

        this.instance.on('connect', () => {
            this.connected = true;
            if (!this.previouslyConnected) {
                this.previouslyConnected = true;
                this.log(`Connected${this.attempts > 1 ? ` after ${this.attempts} attempts` : ''}`);
            } else {
                this.log(`Reconnected after ${this.attempts} attempt${this.attempts > 1 ? 's' : ''}`);
            }
            this.attempts = 0;
        });

        this.instance.on('error', (e: any) => {
            if (e instanceof Error) {
                this.log(e.message);
            } else this.log(`${e}`);
        });

        this.instance.on('end', () => {
            this.log(`Connection ended`);
            this.connected = false;
            if (retryConnectionOnFail) {
                this.notifyScheduledAttempt();
            }
        });
    }

    private notifyScheduledAttempt() {
        if (this.attempts < 10 && checkInterval) this.log(`Attempting reconnection in ${checkInterval}s`);
        setTimeout(() => {
            this.attemptConnection();
        }, 1000 * checkInterval);
    }

    private async attemptConnection() {
        this.attempts += 1;
        this.attempts <= 10 && this.log(`Attempting Connection...${this.attempts > 1 ? ` (attempt ${this.attempts})` : ''}`);
        await this.instance.connect().catch((e: any) => {
            if (e instanceof Error) {
                if (this.attempts <= 10) this.log(e.message);
            } else {
                if (this.attempts <= 10) this.log(`${e}`);
            }
            this.connected = false;
        });

        if (!this.connected && retryConnectionOnFail) {
            this.notifyScheduledAttempt();
        }

        if (this.attempts === 10) this.log(`Silencing further attempts to preserve log size`);
    }

    private async connectDB() {
        this.log('(Mongoose) Attempting to connect to mongoDB database...');
        mongoose
            .connect(modules.minecraft.mongodb_url, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useFindAndModify: false,
            })
            .then(() => this.log('(Mongoose) Successfully connected'))
            .catch((e) => {
                if (e instanceof Error) this.log(e.message);
                else this.log(`${e}`);
            });
    }

    public log(message: string, initialLog = false) {
        try {
            const logMessage = `\n[${new Date().toLocaleTimeString()}] ${message}`;
            if (initialLog) fs.writeFileSync(this.logFile, logMessage);
            else fs.appendFileSync(this.logFile, logMessage);
        } catch (error) {
            console.log(error);
        }
    }

    public isConnected = () => this.connected;
}

const minecraftServer = new MinecraftServer();

export default minecraftServer;
