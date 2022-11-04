require('dotenv').config()
const fs = require("fs");
const qrcode = require("qrcode-terminal");
const { Client, LocalAuth, MessageMedia, Buttons, List } = require("whatsapp-web.js");
const axios = require("axios");


// Path where the session data will be stored
const SESSION_FILE_PATH = "./session.json";
// Environment variables
const country_code = process.env.COUNTRY_CODE;
const number = process.env.NUMBER;
const msg = process.env.MSG;

// Load the session data if it has been previously saved
let sessionData;
if (fs.existsSync(SESSION_FILE_PATH)) {
    sessionData = require(SESSION_FILE_PATH);
}

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: false }
});
client.initialize();

client.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => {
    console.log('AUTHENTICATED');
});

client.on('auth_failure', msg => {
    // Fired if session restore was unsuccessful
    console.error('AUTHENTICATION FAILURE', msg);
});

client.on("ready", () => {
    console.log("Client is ready!");

    setTimeout(() => {
      let chatId = `${country_code}${number}@c.us`;
        client.sendMessage(chatId, msg).then((response) => {
            if (response.id.fromMe) {
                console.log("It works!");
            }
        })
    }, 5000);
});

const myGroupName = "BOT Group";

client.on('message', async msg => {
    console.log('MESSAGE RECEIVED', msg);

    if (msg.body === '!ping reply') {
        // Send a new message as a reply to the current one
        msg.reply('pong');

    } else if (msg.body === 'ping') {
        // Send a new message to the same chat
        client.sendMessage(msg.from, 'pong');
    } else if (msg.body === '!buttons') {
        let button = new Buttons('Button body',[{body:'bt1'},{body:'bt2'},{body:'bt3'}],'title','footer');
        client.sendMessage(msg.from, button);
    } else if (msg.body === '!list') {
        let sections = [{title:'sectionTitle',rows:[{title:'ListItem1', description: 'desc'},{title:'ListItem2'}]}];
        let list = new List('List body','btnText',sections,'Title','footer');
        client.sendMessage(msg.from, list);
    } else if (msg.body === 'menu'){
            // Not Working for WA Business
            let button = new Buttons("Recuerda todo este contenido es gratis y estaria genial que me siguas!",[{"body":"😎 Cursos"},{"body":"👉 Youtube"},{"body":"😁 Telegram"}], '', 'Gracias');
            client.sendMessage(msg.from, button);
            
            const productsList = new List(
              "Here's our list of products at 50% off",
              "View all products",
              [
                {
                  title: "Products list",
                  rows: [
                    { id: "apple", title: "Apple" },
                    { id: "mango", title: "Mango" },
                    { id: "banana", title: "Banana" },
                  ],
                },
              ],
              "Please select a product"
            );
            client.sendMessage(msg.from, productsList);
  
          
        //client.sendMessage(msg.from,'Not Working for WA Business');
    } else if (msg.body === "meme") {
        //get media from url
        const media = await MessageMedia.fromUrl(
          "https://raw.githubusercontent.com/ravendano014/IntranetDDTI/54e91dcd3cfce4b31fa0b9ef61b3d541ce58de4f/Integration.png"
        );
    
        //replying with media
        client.sendMessage(msg.from, media, {
          caption: "meme",
        });
      } else if (msg.body) {
        axios
          .get(
            `https://db.ygoprodeck.com/api/v7/cardinfo.php?name=${encodeURIComponent(
              msg.body
            )}`
          )
          .then(async (res) => {
            if (res.data.error) {
              msg.reply("No card matching your query was found in the database.");
            } else {
              const media = await MessageMedia.fromUrl(
                res.data.data[0].card_images[0].image_url
              );
              client.sendMessage(msg.from, media, {
                caption: `Name : ${res.data.data[0].name}\nType : ${res.data.data[0].type}\nDesc : ${res.data.data[0].desc}
                `,
              });
            }
          })
          .catch((error) => {
            console.error(error);
          });
      }
});

client.on("message", (message) => {
    // Not Working for WA Business
    if(message.type === 'list_response'){
      message.reply(`You've selected ${message.body}`);
    }
  });

client.on('message_create', (msg) => {
    // Fired on all message creations, including your own
    if (msg.fromMe) {
        // do stuff here
    }
});

client.on('message_revoke_everyone', async (after, before) => {
    // Fired whenever a message is deleted by anyone (including you)
    console.log(after); // message after it was deleted.
    if (before) {
        console.log(before); // message before it was deleted.
    }
});

client.on('message_revoke_me', async (msg) => {
    // Fired whenever a message is only deleted in your own view.
    console.log(msg.body); // message before it was deleted.
});


