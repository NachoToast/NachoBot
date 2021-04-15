const config = require('../config.json')
module.exports= {
    name: 'osu/authenticate',
    description: 'get osu authentication bearer token',
    execute: async (client, message, args) => {
            //var osu_token;
            const fetch = require('node-fetch');

        
                const response = await fetch("https://osu.ppy.sh/oauth/token", {
                    method: 'post',
                    headers: {
                      'Accept': 'application/json',
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        "grant_type": "client_credentials",
                        "client_id": 4436,
                        "client_secret": config.osu_token,
                        "scope": "public"
                    })
                })
                const data = await response.json();
                osu_token = data.access_token
                //console.log(data);
                //message.channel.send(osu_token);
            if ((args[0] === 'profile') || (args[0] === 'p')) {
                client.commands.get('osu/profile').execute(message, args, osu_token, fetch)
            }
    }
}