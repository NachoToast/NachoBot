module.exports = {
    name: 'makeStuff',
    // makes some stuff
    execute: async (rcon) => {
        {
            // do stuff
            // console.log(rcon);
            // let responses = await Promise.all([rcon.send('help'), rcon.send('whitelist list')]);
            // for (response of responses) {
            //     console.log(responses);
            // }
            // const [ox, oy, oz] = (await rcon.send(`data get entity NachoToast Pos`))
            //     .split(/[\[\]]/)[1]
            //     .split(',')
            //     .map((e) => Math.floor(Number(e.trim().substring(0, e.trim().length - 1))));
            // for (let j = 0; j < 128 ** 2; j++) {
            //     const x = j % 128,
            //         y = (j / 128) | 0;
            //     const c_re = ((2 * x) / 127 - 1.6) * 1.2;
            //     const c_im = ((2 * y) / 127 - 1) * 1.2;
            //     let z_re = 0,
            //         z_im = 0,
            //         i = 0;
            //     while (i < 23 && z_re ** 2 + z_im ** 2 < 4) {
            //         let re = z_re ** 2 - z_im ** 2 + c_re;
            //         z_im = 2 * z_re * z_im + c_im;
            //         z_re = re;
            //         i += 1;
            //     }
            //     const block = ['obsidian', 'obsidian', 'blue_terracotta', 'cyan_wool', 'light_blue_wool', 'white_wool'][
            //         (i / 4) | 0
            //     ];
            //     await rcon.send(`setblock ${ox + -64 + x} ${oy + 64} ${oz + -64 + y} ${block}`);
            // }
        }

        console.log('done!');
    },
};
