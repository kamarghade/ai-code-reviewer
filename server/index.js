import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import bodyParser from 'body-parser';
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";

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

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const gemini = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(path.join(__dirname, '../build')));

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

        if (!process.env.GEMINI_API_KEY) {
            console.error('GEMINI_API_KEY not found in environment variables');
            return res.status(500).json({ error: 'API key not configured' });
        }

        // Gemini AI Tool
        const response = await gemini.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Please explain ${lang} code for below snippet:\n${message}`,
        });

        res.status(200).json({
            answer: response?.text,
            timestamp: new Date().toISOString(),
        });

        // Open AI Tool
        // const response = await client.responses.create({
        //     model: "gpt-5-nano",
        //     input: `Please explain ${lang} code for below snippet:\n${message}`,
        //     tools: [{ type: 'web_search_preview' }],
        // });

        // res.status(200).json({
        //     answer: response?.output_text,
        //     timestamp: new Date().toISOString(),
        // });
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

        if (!process.env.GEMINI_API_KEY) {
            console.error('GEMINI_API_KEY not found in environment variables');
            return res.status(500).json({ error: 'API key not configured' });
        }

        // Gemini AI Tool
        const response = await gemini.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Please optimize the below ${lang} code:\n${message}`,
        });

        res.status(200).json({
            answer: response?.text,
            timestamp: new Date().toISOString(),
        });


        // const response = await client.responses.create({
        //     model: "gpt-5-nano",
        //     input: `Please optimize the below ${lang} code:\n${message}`,
        //     tools: [{ type: 'web_search_preview' }],
        // });
        // // mock response
        // // {"message":"fetch('https://jsonplaceholder.typicode.com/users/1')\n.then(res => res.json())\n.then(data => console.log(data))\n.catch(err => console.error('Error:', err));","lang":"javascript"}

        // res.status(200).json({
        //     answer: response?.output_text,
        //     timestamp: new Date().toISOString(),
        // });
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

        if (!process.env.GEMINI_API_KEY) {
            console.error('GEMINI_API_KEY not found in environment variables');
            return res.status(500).json({ error: 'API key not configured' });
        }

        const prompt = `Please generate Readme for below ${lang} code:\n${message}`;

        // Gemini AI Tool
        const response = await gemini.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        // res.status(200).json({
        //     answer: response?.text,
        //     timestamp: new Date().toISOString(),
        // });

        // const response = await client.responses.create({
        //     // model: "gpt-5-nano",
        //     model: "gpt-4o-mini", // Fast & cost-effective
        //     messages: [{ role: "user", content: prompt }],
        //     // input: `Please generate Readme for below ${lang} code:\n${message}`,
        //     // tools: [{ type: 'web_search_preview' }],
        //     temperature: 0.7
        // });
        const readmeContent = response?.text;

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

app.post('/api/github-readme', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ error: 'Please provide a GitHub Key URL' });
        }

        // Extract owner and repo
        const regex = /github\.com\/([^\/]+)\/([^\/]+)/;
        const match = url.match(regex);

        if (!match) {
            return res.status(400).json({ error: 'Invalid GitHub URL' });
        }

        const owner = match[1];
        const repo = match[2].replace('.git', '');

        const headers = {
            'Accept': 'application/vnd.github.v3+json'
        };

        // Use GITHUB_TOKEN if available to increase rate limits
        if (process.env.GITHUB_TOKEN) {
            headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
        }

        // 1. Get default branch
        const repoInfoResp = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
        if (!repoInfoResp.ok) {
            if (repoInfoResp.status === 404) throw new Error('Repository not found or private');
            if (repoInfoResp.status === 403) throw new Error('GitHub API rate limit exceeded');
            throw new Error('Failed to fetch repo info');
        }
        const repoInfo = await repoInfoResp.json();
        const defaultBranch = repoInfo.default_branch;

        // 2. Get file tree
        const treeResp = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`, { headers });
        if (!treeResp.ok) throw new Error('Failed to fetch file tree');
        const treeData = await treeResp.json();

        // 3. Filter files
        const files = treeData.tree
            .filter(item => item.type === 'blob')
            .map(item => item.path)
            .filter(path => {
                const ignore = ['node_modules', '.git', 'dist', 'build', 'coverage', 'yarn.lock', 'package-lock.json', 'pnpm-lock.yaml'];
                return !ignore.some(i => path.includes(i)) && !path.match(/\.(png|jpg|jpeg|gif|ico|svg|pdf|zip|tar|gz|mp4|webm)$/i);
            })
            .slice(0, 100);

        // 4. Fetch package.json
        let packageJsonContent = '';
        if (files.includes('package.json')) {
            const pkgResp = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/package.json`);
            if (pkgResp.ok) {
                packageJsonContent = await pkgResp.text();
            }
        }

        const prompt = `
You are a documentation generator. Based on the following project file structure and package.json (if available), create a professional README.md file.
Include:
- Project Title
- Description
- Tech Stack
- Installation
- Usage

Project: ${owner}/${repo}
File Structure:
${files.join('\n')}

${packageJsonContent ? `package.json content:\n${packageJsonContent}` : ''}
`;

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: 'API key not configured' });
        }

        const response = await gemini.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        res.status(200).json({
            answer: response?.text,
            timestamp: new Date().toISOString(),
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: error.message || 'Failed to generate README from GitHub',
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

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
});