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

const createPrompt = (topic) => {
    return `
    Eres un asistente para aprender programación. Genera una pregunta de opción múltiple adecuada para desarrolladores junior sobre ${topic}. 
    Incluye cuatro opciones (a, b, c, d) y señala cuál es la correcta. 
    La respuesta debe seguir este formato:

    [Pregunta aquí]
    (a) Opción A
    (b) Opción B
    (c) Opción C
    (d) Opción D

    Respuesta correcta: [Opción correcta]
    Explicación: [Explicación de la respuesta correcta]
    `;
};

async function generateMultipleChoiceQuestion(topic) {
    const prompt = createPrompt(topic);
    const genAI = new GoogleGenerativeAI(process.env.API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
        const response = await model.generateContent(prompt); 
        const generatedText = response.response.text(); 

        const cleanText = (text) => {
            return text
            .replace(/#/g, '')           
            .replace(/\*/g, '')        
            .replace(/\n/g, ' ')       
            .replace(/\s+/g, ' ')        
            .trim()                      
            
        };

        const cleanedQuestion = cleanText(generatedText);
        return cleanedQuestion; 
        
    } catch (error) {
        console.error("Error al generar la pregunta:", error.response ? error.response.data : error.message);
        throw error; 
    }
}

app.get('/api', async (req, res) => {
    const topic = req.query.topic || "Node.js";   
    try {
        const question = await generateMultipleChoiceQuestion(topic); 
        res.json({ question }); 
    } catch (error) {
        res.status(500).json({ error: "Error al generar la pregunta" });
    }

})

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
})