import { Message } from 'discord.js';
import mongoose from 'mongoose';
import { Command } from '../../../../interfaces/Command';
import { User, UserModel, userSchema } from '../../../../models/user';

class Migrate implements Command {
    public name = 'migrate';
    public aliases = ['m'];

    public adminOnly = true;
    public description = 'Command for performing database migrations. For usage by <@240312568273436674> only.';

    /** Migrate from old DB to new DB, and check usernames since they weren't preserved in old DB schema. */
    // public async execute({ message }: { message: Message }) {
    //     if (message.author.id !== '240312568273436674') return;

    //     const allOldUsers: Application[] = await userOld.find();
    //     const newUsers = [];
    //     const badUsers = [];
    //     const mediumUsers = [];

    //     console.log('Migrating users...');
    //     for (const { status, minecraft, discord, applied } of allOldUsers) {
    //         console.log(`Migrating ${minecraft}...`);
    //         const newLog = makeLogItem(message.author.id, status as Statuses, `Migration to v2.0`);
    //         const [isValid, actualUsername] = await getActualUsername(minecraft);
    //         if (!isValid) {
    //             badUsers.push([minecraft, discord]);
    //             continue;
    //         }

    //         const newUser = await makeCustomApplication(actualUsername, discord, applied.toISOString(), status as Statuses, [
    //             newLog,
    //         ]);
    //         if (newUser instanceof WhitelistError) {
    //             console.log(newUser.message);
    //             mediumUsers.push([actualUsername, discord]);
    //             continue;
    //         }

    //         newUsers.push(newUser.minecraft);
    //     }
    //     console.log(
    //         `Migration done! Had ${newUsers.length} successes out of ${allOldUsers.length} total users. ${badUsers.length} bad users, ${mediumUsers.length} medium users.`
    //     );
    //     console.log(badUsers);
    //     console.log('---');
    //     console.log(mediumUsers);
    // }

    public async execute({ message }: { message: Message }) {
        if (message.author.id !== '240312568273436674') return;
        message.channel.send(`Migration not needed.`);
        return;

        const devUsers: User[] = await UserModel.find();

        await this.liveModel.insertMany(devUsers);

        const liveUsers: User[] = await this.liveModel.find();

        console.log(`Done!`, liveUsers.length);
    }

    private liveModel = mongoose.model(`player_v2`, userSchema);
}

export const migrate = new Migrate();
