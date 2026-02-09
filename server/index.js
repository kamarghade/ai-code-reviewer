import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import bodyParser from 'body-parser';
import OpenAI from "openai";

dotenv.config();

const app = express();
const PORT = process.env.SERVER_PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json(
    { limit: '10mb' },
));
// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// Parse application/json
app.use(bodyParser.json());

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/api/explainer', async (req, res) => {
    try {
        const { message, lang } = req.body;
        if (!message) {
            console.log('Missing required fields:', { message: !!message });
            return res.status(400).json({ error: 'Please provide the code snippet' });
        }

        if (!lang) {
            console.log('Missing required fields:', { lang: !!lang });
            return res.status(400).json({ error: 'Please select the code langauge' });
        }

        if (!process.env.OPENAI_API_KEY) {
            console.error('OPENAI_API_KEY not found in environment variables');
            return res.status(500).json({ error: 'API key not configured' });
        }

        const response = await client.responses.create({
            model: "gpt-5-nano",
            input: `Please explain ${lang} code for below snippet:\n${message}`,
            tools: [{ type: 'web_search_preview' }],
        });
        
        res.status(200).json({
            answer: response?.output_text,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        res.status(500).json({
            error: error.message,
        });
    }
});

app.post('/api/optimizer', async (req, res) => {
    try {
        const { message, lang } = req.body;
        if (!message) {
            console.log('Missing required fields:', { message: !!message });
            return res.status(400).json({ error: 'Please provide the code snippet' });
        }

        if (!lang) {
            console.log('Missing required fields:', { lang: !!lang });
            return res.status(400).json({ error: 'Please select the code langauge' });
        }

        if (!process.env.OPENAI_API_KEY) {
            console.error('OPENAI_API_KEY not found in environment variables');
            return res.status(500).json({ error: 'API key not configured' });
        }

        const response = await client.responses.create({
            model: "gpt-5-nano",
            input: `Please optimize the below ${lang} code:\n${message}`,
            tools: [{ type: 'web_search_preview' }],
        });
        
        res.status(200).json({
            answer: response?.output_text,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        res.status(500).json({
            error: error.message,
        });
    }
});

app.post('/api/readme', async (req, res) => {
    try {
        const { message, lang } = req.body;
        if (!message) {
            console.log('Missing required fields:', { message: !!message });
            return res.status(400).json({ error: 'Please provide the code snippet' });
        }

        if (!lang) {
            console.log('Missing required fields:', { lang: !!lang });
            return res.status(400).json({ error: 'Please select the code langauge' });
        }

        if (!process.env.OPENAI_API_KEY) {
            console.error('OPENAI_API_KEY not found in environment variables');
            return res.status(500).json({ error: 'API key not configured' });
        }

        const prompt = `Please generate Readme for below ${lang} code:\n${message}`;
        const response = await client.responses.create({
            // model: "gpt-5-nano",
            model: "gpt-4o-mini", // Fast & cost-effective
            messages: [{ role: "user", content: prompt }],
            // input: `Please generate Readme for below ${lang} code:\n${message}`,
            // tools: [{ type: 'web_search_preview' }],
            temperature: 0.7
        });
        
        const readmeContent = response.choices[0].message.content;
        
        // fs.writeFileSync("README.md", readmeContent, "utf-8");

        res.status(200).json({
            answer: readmeContent,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        res.status(500).json({
            error: error.message,
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});