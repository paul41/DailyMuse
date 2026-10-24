const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function startGeminiChat() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  const chat = model.startChat();

  let response = await chat.sendMessage(`summarize the following: The Supreme Court on Wednesday (July 30, 2025) questioned the conduct of Allahabad High Court judge, Justice Yashwant Varma, saying he had moved the Supreme Court against the in-house inquiry procedure initiated by former Chief Justice of India Sanjiv Khanna only after the outcome of the probe had become “unpalatable” for him.
    The report of an in-house inquiry committee of three judges had confirmed the presence of ‘burnt currency’ in a gutted outhouse at Justice Varma’s residential premises in New Delhi after a fire in mid-March. The in-house inquiry, appointed by the then Chief Justice Khanna, had recommended his removal. Chief Justice Khanna had forwarded the report to the President and Prime Minister in May, seconding the recommendation of the inquiry panel.`);
  return response.response.text()
}

// Export the function
module.exports = { startGeminiChat };

