const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');
dotenv.config();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;

const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

app.use(express.json());
app.use(morgan('tiny'));

app.get('/api', async (req, res) => {
    const genAI = new GoogleGenerativeAI(process.env.API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = "Generate a multiple-choice question suitable for junior developers about Node.js.";

    const result = await model.generateContent(prompt);
    res.json(result.response.text());
})

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
})