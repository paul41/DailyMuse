const {OpenAI} = require("openai");
require('dotenv').config();
// import fetch from "node-fetch";
const client = new OpenAI({ apiKey: process.env.MUSE_KEY });
(async () => {
  const response = await client.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are a helpful assistant that writes bedtime stories." },
      { role: "user", content: "Write a short bedtime story about a unicorn." },
    ],
  });

  console.log(response.choices[0].message.content);
})()