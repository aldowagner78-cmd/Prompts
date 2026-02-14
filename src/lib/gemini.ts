import { callAI } from "./ai";

export async function analyzePromptQuality(prompt: string, modelRequested?: string): Promise<string> {
  const model = modelRequested || localStorage.getItem("gemini_model") || "gemini-2.5-flash";

  const systemInstruction = `You are a Senior Prompt Engineer specialized in LLM performance auditing.
  Analyze the following prompt and provide a concise Quality Audit in SPANISH.
  
  Focus on:
  1. Clarity & Ambiguity
  2. Context Sufficiency
  3. Instruction Precision
  4. Role definition
  
  Format:
  - Puntuación: X/100
  - Debilidades: (max 3 puntos clave)
  - Sugerencia de Oro: (La mejora más importante)`;

  return callAI({
    prompt: `Analyze this prompt: ${prompt}`,
    systemInstruction,
    model: model
  });
}

export async function generateOptimizedPrompt(originalPrompt: string, config: any) {
  const model = config.model || localStorage.getItem("gemini_model") || "gemini-2.5-flash";

  const projectContext = config.projectStatus === 'new'
    ? "Este es un PROYECTO NUEVO. Instruye a la IA para que cree una carpeta dedicada en el Escritorio de Windows y desarrolle todo desde cero (Scaffolding completo)."
    : `Este es un PROYECTO EXISTENTE localizado en: ${config.projectPath}. La IA debe trabajar sobre esta base de código existente.`;

  const variantInstruction = config.variant === 'B'
    ? "Genera una variante B alternativa. Esta debe ser más creativa, arriesgada y detallada que la versión estándar."
    : "Genera la versión estándar optimizada siguiendo las mejores prácticas.";

  const systemInstruction = `Eres un Maestro de la Ingeniería de Prompts (Senior Prompt Engineer) especializado en Agentes Autónomos.
  Tu misión es transformar ideas vagas en directivas de ejecución "Master" para agentes como Antigravity, Cursor o Windsurf.

  ESTRATEGIA DE OPTIMIZACIÓN (Framework CO-STAR):
  1. CONTEXTO: Define el entorno de desarrollo y la situación actual del proyecto.
  2. OBJETIVO: Define EXACTAMENTE qué debe construir el Agente.
  3. ESTILO Y ROL: Asigna una personalidad experta (Senior Dev, UI Expert).
  4. TONO: Técnico, resolutivo y eficiente.
  5. AUDIENCIA: ${config.variables.audience || "auto"}
  6. RESPUESTA: Formato Markdown estructurado con secciones de ejecución.

  REGLAS DE ORO (INVIOLABLES):
  - ORDEN E-E-F: Estructura -> Estética -> Función (en ese orden exacto).
  - STACK GRATIS: Priorizar Firebase, Vercel, NotebookLM y herramientas sin costo.
  - SIN CHARLATANERÍA: No saludar, no despedirse, no explicar el prompt. Solo entregar el prompt ejecutable.
  - DELIMITADORES CLAROS: Usar ### y bloques de código para facilitar el parseo del agente.

  FLUJO DE TRABAJO PARA EL AGENTE:
  Fase 0: Investigación (NotebookLM) -> Fase 1: Prototipado (Stitch) -> Fase 2: Implementación (React/Tailwind) -> Fase 3: Persistencia (Firebase).

  CONTEXTO DEL PROYECTO ACTUAL: ${projectContext}

  ${variantInstruction}

  ESTRUCTURA OBLIGATORIA DEL OUTPUT:
  <role> Definición de rol experto </role>
  <objective> Meta final clara </objective>
  <workflow> Pasos detallados NLM -> Stitch -> Code -> Firebase </workflow>
  <rules> Restricciones técnicas y de diseño </rules>
  <next_steps> El primer comando exacto que debe ejecutar el agente </next_steps>
  Configuración adicional:
  - Razonamiento CoT: ${config.cot ? "SÍ" : "NO"}
  - Salida JSON: ${config.jsonOutput ? "SÍ" : "NO"}
  - Pública: ${config.variables.audience || "Universal"}
  IMPORTANTE: Solo escribe en ESPAÑOL.`;

  return callAI({
    prompt: `User Input: ${originalPrompt}`,
    systemInstruction,
    model: model
  });
}

export async function refinePrompt(prompt: string, audit: string, modelRequested?: string): Promise<string> {
  const model = modelRequested || localStorage.getItem("gemini_model") || "gemini-2.5-flash";

  const systemInstruction = `Eres un Ingeniero de Prompts Senior especializado en Optimización Iterativa.
  Tu misión es refinar un prompt basándote en una auditoría técnica.

  REGLAS DE REFINAMIENTO CRÍTICAS:
  1. PRESERVACIÓN DE CALIDAD: Si el prompt original ya tiene una puntuación alta (ej. >80), NO realices cambios estructurales drásticos. Mantén lo que funciona.
  2. PRIORIDAD "SUGERENCIA DE ORO": La sugerencia más importante de la auditoría DEBE ser incorporada de forma explícita y robusta.
  3. CORRECCIÓN DE DEBILIDADES: Solo modifica las partes del prompt que la auditoría identifica como "Debilidades".
  4. MANTENER ARQUITECTURA MASTER: Conserva la estructura de tags (<role>, <objective>, <workflow>, <rules>, <next_steps>) y el enfoque E-E-F (Estructura, Estética, Función).
  5. EVITAR LA REGRESIÓN: No diluyas instrucciones técnicas precisas por intentar ser más breve. La precisión técnica es prioridad sobre la brevedad.
  6. SALIDA LIMPIA: Devuelve SOLO el texto del prompt refinado. Sin introducciones ni comentarios.
  7. IDIOMA: Mantén siempre el idioma en ESPAÑOL.`;

  return callAI({
    prompt: `PROMPT ORIGINAL:\n${prompt}\n\nINFORME DE AUDITORÍA:\n${audit}\n\nPor favor, genera el PROMPT REFINADO:`,
    systemInstruction,
    model: model
  });
}
