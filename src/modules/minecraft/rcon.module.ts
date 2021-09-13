import mongoose from 'mongoose';
import { Rcon } from 'rcon-client';
import { modules } from '../../config.json';

const { host, port, password, retryConnectionOnFail, checkInterval, silent } = modules.minecraft.rcon;

export interface RconInstance {
    connected: boolean;
    rcon: Rcon;
}

class MinecraftServer {
    private connected = false;
    private instance: Rcon;

    constructor() {
        !silent && console.log(`[RCON] Instantiating...`);
        this.instance = new Rcon({ host, port, password });
        this.attemptConnection();

        this.instance.on('connect', () => {
            console.log(`[RCON] Connection Established`);
        });

        this.instance.on('error', () => {
            !silent && console.log(`[RCON] An Error Occured`);
        });

        this.instance.on('end', () => {
            console.log(`[RCON] Connection Ended`);
            this.connected = false;
            if (!this.connected && retryConnectionOnFail) {
                !silent && console.log(`[RCON] Scheduled Reconnect Attempt (${checkInterval}s)`);
                setTimeout(() => {
                    this.attemptConnection();
                }, 1000 * checkInterval);
            }
        });
    }

    private async attemptConnection() {
        !silent && console.log(`[RCON] Attempting Connection...`);
        await this.instance
            .connect()
            .then(() => {
                this.connected = true;
            })
            .catch((e: Error) => {
                !silent && console.log(`[RCON] Failed to Connect`);
                this.connected = false;
            });

        if (!this.connected && retryConnectionOnFail) {
            !silent && console.log(`[RCON] Scheduled Reconnect Attempt (${checkInterval}s)`);
            setTimeout(() => {
                this.attemptConnection();
            }, 1000 * checkInterval);
        }
    }

    private async connectDB() {
        // wip
    }
}

export default MinecraftServer;
