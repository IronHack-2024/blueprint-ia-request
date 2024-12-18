// Import third party modules
const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');
dotenv.config();
const PORT = process.env.PORT || 3000;


// Importing the generative AI library from google
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { result } = require('lodash');

const app = express();

app.use(express.json());
app.use(morgan('tiny'));

// Function to generate a prompt for the AI model (gemini in this case)
const createPrompt = (topic) => {
    return `
    You are an expert programming instructor specialized in fullstack development. Generate a random multiple choice question in english suitable for junior fullstack developers. Focus on practical, real-world scenarios covering: ${topic}. 
    Add a code snippet ONLY if the question would be clearer or more engaging(for example, to illustrate code behavior or provide more context), include a short, relevant code example.

    Return ONLY valid JSON like this example:
    {
        "question": "Question text here",
        "codeSnippet": "Add a code snippet if needed, if not leave it empty",
        "answerOptions": [
            {"answer": "Option 1", "isCorrect": boolean},
            {"answer": "Option 2", "isCorrect": boolean},
            {"answer": "Option 3", "isCorrect": boolean},
            {"answer": "Option 4", "isCorrect": boolean}
        ],
        "explanation": "Explanation here"
    }`;
};

// Function to generate a multiple-choice question using the AI model
async function generateMultipleChoiceQuestion(topic) {
    const prompt = createPrompt(topic); // Create prompt with topic
    const genAI = new GoogleGenerativeAI(process.env.API_KEY); // Initialize the model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Define which model we are using

    try {
        const response = await model.generateContent(prompt); // Request content generation from the model
        const generatedText = response.response.text(); // Retrieve the generated text
        const jsonStart = generatedText.indexOf('{');
        const jsonEnd = generatedText.lastIndexOf('}') + 1;
        return JSON.parse(generatedText.slice(jsonStart, jsonEnd));
    } catch (error) {
        console.error("Error generating the question:", error.response ? error.response.data : error.message);
        throw error; 
    }
}

// Endpoint to get the generated question from the AI
app.get('/api/question/ai', async (req, res) => {

    const topic = req.query.topic || "frontend and Backend programming";

    if (topic.length < 2 || topic.length > 140) {
    return res.status(400).json({ error: "Topic must be at least 2 characters and not exceed 140 characters."});
    }

    const amount = Math.min(Math.max(parseInt(req.query.amount) || 1, 1), 10);
    const questions = [];

    try {
        for (let i = 0; i < amount; i++) {
            const quizData = await generateMultipleChoiceQuestion(topic);
            questions.push({
                ...quizData, 	
                status: "pending"
	});
        }
        res.status(200).json({
            message: "Random question delivered successfully",
            results: questions
        });
    } catch (error) {
        res.status(500).json({ error: "Error generating the question" });
    }

})

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
})