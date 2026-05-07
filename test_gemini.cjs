const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI("AIzaSyBLjQKxMHtneWVRYmveBq-N2iN5Xl3eAGs");
async function run() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hallo");
    console.log("Success:", result.response.text());
  } catch (e) {
    console.log("Error gemini-1.5-flash:", e.message);
  }
  try {
    const model2 = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result2 = await model2.generateContent("Hallo");
    console.log("Success:", result2.response.text());
  } catch (e) {
    console.log("Error gemini-pro:", e.message);
  }
}
run();
