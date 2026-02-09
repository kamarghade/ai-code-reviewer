/**
 * Node.js script to read the current project directory
 * and generate a README.md file using OpenAI API.
 */

import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

// Load environment variables (requires `npm install dotenv`)
import dotenv from 'dotenv';
dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Function to recursively get all files in a directory
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.relative(process.cwd(), filePath));
    }
  });

  return arrayOfFiles;
}

async function generateReadme() {
  try {
    console.log("📂 Reading project directory...");
    const files = getAllFiles(process.cwd());

    console.log("🤖 Asking OpenAI to generate README...");
    const prompt = `
You are a documentation generator. Based on the following project file list, create a professional README.md file with:
- Project title
- Description
- Installation instructions
- Usage examples
- License section

Project files:
${files.join('\n')}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Fast & cost-effective
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    });

    const readmeContent = response.choices[0].message.content;

    fs.writeFileSync("README.md", readmeContent, "utf-8");
    console.log("✅ README.md generated successfully!");
  } catch (error) {
    console.error("❌ Error generating README:", error);
  }
}

generateReadme();
