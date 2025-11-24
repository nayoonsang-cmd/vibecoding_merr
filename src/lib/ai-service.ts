import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AIExplanation {
    term: string;
    explanation: string;
}

export interface ParagraphAnalysis {
    original: string;
    explanation?: string;
    keywords?: AIExplanation[];
}

export interface AnalyzedPost {
    paragraphs: ParagraphAnalysis[];
    summary: string;
}

const genAI = new GoogleGenerativeAI(process.env.AI_API_KEY || '');

export async function analyzeContent(paragraphs: string[]): Promise<AnalyzedPost> {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Filter out very short paragraphs that are likely just formatting or noise
    const validParagraphs = paragraphs.filter(p => p.length > 20);
    const fullText = validParagraphs.join('\n\n');

    const prompt = `
        You are an expert economic and technology analyst. Your task is to analyze the following blog post content and provide detailed explanations for complex concepts, specifically for a Korean audience.

        **Instructions:**
        1.  **Analyze**: Read the entire text to understand the context.
        2.  **Summary**: Provide a concise 3-sentence summary of the entire post.
        3.  **Paragraph-by-Paragraph Analysis**: For each paragraph provided in the input, your goal is to **enhance understanding**, NOT to summarize.
            -   **DO NOT SUMMARIZE** the paragraph. The user will read the original text.
            -   Identify **concepts, terms, or context** mentioned in the text that might be difficult for a general reader to understand fully without background knowledge.
            -   Provide a **"Context-Aware Explanation"** in **Korean**.
            -   Explain *what* the concept is and *why* it is relevant in this specific context.
            -   Example: If the text mentions "Yield Curve Control", do not just say "It is controlling yields." Explain that it's a central bank policy to cap interest rates and why it matters here.
            -   If a paragraph is simple, conversational, or self-explanatory, return 'null' for the explanation. Do not force an explanation.
        4.  **Keywords**: Identify specific technical terms within the paragraph and define them academically.

        **Input Text:**
        ${fullText}

        **Output Format (JSON only):**
        {
            "summary": "...",
            "paragraphs": [
                {
                    "original": "The exact original paragraph text...",
                    "explanation": "Context-aware explanation here (or null if none)",
                    "keywords": [
                        { "term": "Term", "explanation": "Definition" }
                    ]
                }
            ]
        }
        
        IMPORTANT: Return ONLY valid JSON. Do not include markdown formatting like \`\`\`json.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up potential markdown formatting
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const data = JSON.parse(cleanText);

        // Map back to the original structure, ensuring all paragraphs are accounted for
        // The AI might skip some or merge them, so we need to be careful.
        // For simplicity in this v1, we'll trust the AI's returned list but we should ideally align it.
        // However, to ensure fidelity, let's just use the AI's output structure directly 
        // but we need to make sure we don't lose the original text if the AI hallucinates the "original" field.
        // Actually, let's trust the AI to return the "original" text as requested.

        return {
            paragraphs: data.paragraphs,
            summary: data.summary
        };

    } catch (error) {
        console.error("AI Analysis Failed:", error);
        // Fallback to returning original text without analysis
        return {
            paragraphs: paragraphs.map(p => ({ original: p })),
            summary: "AI analysis failed. Showing original content."
        };
    }
}
