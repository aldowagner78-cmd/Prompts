import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import OpenAI from "openai";

interface AIConfig {
    prompt: string;
    systemInstruction?: string;
    model?: string;
    provider?: 'gemini' | 'groq';
}

export async function callAI(config: AIConfig): Promise<string> {
    // Si el modelo es "auto", usamos el gran "Gemini 2.5 Flash" que el usuario exige.
    let modelName = config.model || localStorage.getItem("gemini_model") || "gemini-2.5-flash";
    if (modelName === "auto") modelName = "gemini-2.5-flash";

    const provider = config.provider || (modelName.includes('gemini') ? 'gemini' : 'groq');
    
    console.log(`[MASTER-AI] Provider: ${provider} | Model: ${modelName}`);

    if (provider === 'gemini') {
        const apiKey = localStorage.getItem("gemini_api_key")?.trim();
        if (!apiKey) throw new Error("Te falta la API Key de Gemini en Ajustes.");
        
        const genAI = new GoogleGenerativeAI(apiKey);
        
        const model = genAI.getGenerativeModel({ 
            model: modelName,
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            ]
        });
        
        try {
            // Unificamos el prompt en un solo string para evitar problemas de compatibilidad con "parts"
            const fullPrompt = `${config.systemInstruction || "Eres un experto en IA."}\n\nSOLICITUD DEL USUARIO:\n${config.prompt}`;

            const result = await model.generateContent(fullPrompt);
            const response = await result.response;
            const text = response.text();
            
            if (!text) throw new Error("Gemini respondió pero el texto está vacío. Puede ser un bloqueo de seguridad de Google.");
            return text;
        } catch (e: any) {
            console.error("[MASTER-AI] Error en Gemini:", e);
            
            // Si el modelo 2.5 falla por no existir, intentamos un fallback silencioso al 1.5 pero avisando
            if (e.message?.includes("not found") || e.message?.includes("404")) {
                console.warn("Modelo 2.5 no encontrado, intentando con 1.5-flash como respaldo...");
                try {
                    const fallbackModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                    const res = await fallbackModel.generateContent(`${config.systemInstruction}\n\n${config.prompt}`);
                    return (await res.response).text();
                } catch (fallbackError: any) {
                    throw new Error(`El modelo "${modelName}" no existe en tu región. Prueba con Gemini 1.5 Flash.`);
                }
            }
            
            if (e.message?.includes("429")) throw new Error("Cuota agotada en Gemini. ¡Pásate a Groq en el selector!");
            throw new Error(`Error de Gemini: ${e.message}`);
        }
    } else {
        const apiKey = localStorage.getItem("groq_api_key")?.trim();
        if (!apiKey) throw new Error("Te falta la API Key de Groq en Ajustes.");
        
        const client = new OpenAI({
            apiKey: apiKey,
            dangerouslyAllowBrowser: true,
            baseURL: "https://api.groq.com/openai/v1"
        });
        
        try {
            const groqModel = (modelName.includes('llama') || modelName.includes('mixtral')) ? modelName : "llama-3.1-70b-versatile";
            
            const response = await client.chat.completions.create({
                model: groqModel,
                messages: [
                    { role: "system", content: config.systemInstruction || "Eres un experto en optimización de prompts." },
                    { role: "user", content: config.prompt }
                ],
                temperature: 0.7,
            });
            const text = response.choices[0].message.content || "";
            if (!text) throw new Error("Groq no devolvió nada.");
            return text;
        } catch (e: any) {
            console.error("[MASTER-AI] Error en Groq:", e);
            throw new Error(`Error de Groq: ${e.message}`);
        }
    }
}
