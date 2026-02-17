import { callAI } from "./ai";

export async function analyzePromptQuality(prompt: string, modelRequested?: string): Promise<string> {
  const model = modelRequested || localStorage.getItem("gemini_model") || "gemini-2.5-flash";

  const systemInstruction = `Eres un Auditor Sénior de Ingeniería de Prompts especializado en evaluación de calidad para agentes autónomos.
  Analiza el prompt proporcionado y genera un Reporte de Auditoría conciso en ESPAÑOL.

  RÚBRICA DE EVALUACIÓN (cada categoría vale hasta 20 puntos):
  1. CLARIDAD Y AMBIGÜEDAD (0-20): ¿Las instrucciones son inequívocas? ¿Hay términos vagos?
  2. COHERENCIA ENTRE SECCIONES (0-20): ¿El <objective> es consistente con el <workflow>? ¿Las <rules> contradicen algo? ¿Hay información duplicada o contradictoria entre secciones?
  3. SUFICIENCIA DE CONTEXTO (0-20): ¿El prompt da suficiente información para ejecutarse sin preguntas?
  4. PRECISIÓN DE INSTRUCCIONES (0-20): ¿Los pasos son concretos y ejecutables? ¿Hay pasos faltantes?
  5. DEFINICIÓN DE ROL Y ALCANCE (0-20): ¿El rol está definido? ¿El alcance es claro y sin contradicciones?

  PENALIZACIONES AUTOMÁTICAS:
  - Contradicción entre <objective> y <workflow>: -15 puntos
  - Contradicción entre <rules> y <workflow>: -10 puntos
  - Instrucción ambigua que permita dos interpretaciones opuestas: -5 puntos por cada una

  FORMATO DE SALIDA:
  - Puntuación: X/100 (suma de las 5 categorías menos penalizaciones)
  - Desglose: [Claridad: X/20 | Coherencia: X/20 | Contexto: X/20 | Precisión: X/20 | Rol: X/20]
  - Debilidades: (máximo 3 puntos clave, ordenados de más grave a menos grave)
  - Sugerencia de Oro: (La mejora MÁS importante. Debe ser específica y accionable. Debe indicar QUÉ cambiar y DÓNDE cambiarlo dentro del prompt.)

  IMPORTANTE: Sé objetivo y consistente. Un prompt que no tiene contradicciones entre secciones DEBE obtener al menos 18/20 en Coherencia.`;

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
  
  - ORDEN A-E-F: La prioridad de desarrollo es siempre: 1° ESTÉTICA → 2° ESTRUCTURA → 3° FUNCIÓN.
    Primero se diseña algo hermoso y moderno, luego se organiza el código, y finalmente se programa la lógica.
  
  - STITCH ES LEY: Los diseños creados en Google Stitch son SAGRADOS. 
    El agente NO DEBE inventar elementos visuales nuevos que no estén en Stitch.
    Debe programar EXACTAMENTE lo que Stitch diseñó: los mismos botones, fuentes, tamaños, colores,
    layouts, iconos, y estilos. Si Stitch lo diseñó, se implementa tal cual. Si no lo diseñó, NO EXISTE.
  
  - PWA OBLIGATORIA: Toda aplicación debe ser una Progressive Web App (PWA) instalable desde
    Chrome o Safari. NO generar APK ni IPA. El prompt debe instruir explícitamente:
    * Generar manifest.json con nombre, iconos, theme_color y display: standalone
    * Configurar Service Worker para cache y soporte offline básico
    * Agregar meta tags para iOS (apple-touch-icon, apple-mobile-web-app-capable)
    * La app debe ser GRATUITA, para Android e iOS vía navegador
  
  - ADAPTACIÓN A LA AUDIENCIA: Si la app va dirigida a un público específico (niños, adultos mayores, 
    profesionales), la interfaz debe adaptarse a la edad y contexto del usuario (tamaños de fuente, 
    complejidad de navegación, paleta de colores apropiada).
  
  - STACK GRATIS: Priorizar Firebase, Vercel, NotebookLM, Stitch, y herramientas sin costo.
  - SIN CHARLATANERÍA: No saludar, no despedirse, no explicar el prompt. Solo entregar el prompt ejecutable.
  - DELIMITADORES CLAROS: Usar ### y bloques de código para facilitar el parseo del agente.

  FLUJO DE TRABAJO OBLIGATORIO PARA EL AGENTE:
  
  Fase 0: INVESTIGACIÓN (NotebookLM)
  → Crear un cuaderno en NotebookLM. Realizar una "Deep Research" buscando aplicaciones SIMILARES 
    a lo que el usuario quiere, tecnologías utilizadas y documentación relevante. 
    Construir una base de conocimiento sólida antes de escribir una sola línea de código.
  
  Fase 0.5: VALIDACIÓN DEL RESEARCH
  → Antes de pasar a Stitch, el agente debe PRESENTAR al usuario un resumen de lo que encontró:
    apps similares descubiertas, tecnologías recomendadas, y enfoque propuesto. 
    El usuario debe APROBAR este resumen antes de continuar al diseño.
  
  Fase 1: PROTOTIPADO VISUAL (Google Stitch)
  → Crear TODAS las interfaces visuales de la aplicación en Stitch. No solo las principales.
    
    IMPORTANTE - UI KIT & ASSETS (OBLIGATORIO):
    Generar una lámina específica llamada "UI_KIT" que contenga por separado:
    * Botones en todos sus estados (primary, secondary, danger, disabled)
    * Inputs, TextAreas, Toggles y Checkboxes con sus estados (focus, error)
    * Paleta de colores completa (bg, text, accents)
    * Tipografía (H1, H2, H3, Body, Caption)
    * Iconografía base a utilizar
    * Componentes de Feedback (Alertas, Toasts, Badges)
    Esto servirá para implementar un Design System consistente desde el inicio.

    CHECKLIST MÍNIMO DE PANTALLAS:
    * Splash / Loading screen
    * Onboarding (si aplica para primera vez)
    * Home / Dashboard principal
    * CADA pantalla de funcionalidad (una por cada feature)
    * Pantalla de Configuración / Ajustes
    * Estados vacíos (Empty States - cuando no hay datos)
    * Estados de error (Error States - cuando algo falla)
    * Modales / Diálogos de confirmación
    Una vez que el usuario APRUEBE los diseños de Stitch, esos diseños son INMUTABLES.
  
  Fase 2: IMPLEMENTACIÓN (React/Vite/Tailwind)
  → Implementar los diseños de Stitch en código, respetando al 100% la estética aprobada.
    Seguir el orden A-E-F: primero estética (CSS/Tailwind para replicar Stitch), 
    luego estructura (componentes/rutas), finalmente función (lógica de negocio).

    STACK TECNOLÓGICO RÍGIDO (NO INVENTAR):
    * Core: Vite + React + TypeScript
    * Estilos: Tailwind CSS (sin preprocesadores complejos)
    * Iconos: lucide-react (OBLIGATORIO, estándar y ligero)
    * Router: react-router-dom (v6+)
    * Gestión de Estado: React Context API (para apps medianas) o Zustand (si es muy compleja)
    * Package Manager: npm (estándar universal)

    REGLAS DE ORO DE IMPLEMENTACIÓN (ZERO ERROR TOLERANCE):
    1. SEED DATA OBLIGATORIO: La app NO PUEDE iniciar vacía. Debe tener datos de prueba (mock data)
       precargados para que se vea "viva" y funcional desde el primer segundo.
       Ej: Si es una To-Do list, debe traer 3 tareas de ejemplo.
    2. MANEJO DE ERRORES VISUAL: Prohibido dejar pantallas en blanco (White Screen of Death).
       Implementar Error Boundaries simples y Try/Catch en toda llamada async (Firebase/API)
       que muestre un Toast o Alerta amigable si falla.
    3. PLACEHOLDERS CONFIABLES: Si necesitas imágenes y no tienes, usa 'https://placehold.co/600x400'
       o crea componentes SVG/CSS puros. NO dejes 'img src=""' rotos.
  
  Fase 3: PERSISTENCIA Y BACKEND (Firebase)
  → Configurar Auth, Firestore y Hosting. Desplegar como PWA.

  CONTEXTO DEL PROYECTO ACTUAL: ${projectContext}

  ${variantInstruction}

  ESTRUCTURA OBLIGATORIA DEL OUTPUT:
  <role> Definición de rol experto </role>
  <objective> Meta final clara y sin ambigüedades </objective>
  <workflow> Fases detalladas: NLM → Validación → Stitch → Code → Firebase. TODAS las pantallas listadas. </workflow>
  <rules> Restricciones técnicas, de diseño, y la regla de Stitch es Ley. </rules>
  <next_steps> El primer comando exacto que debe ejecutar el agente </next_steps>
  
  Configuración adicional:
  - Razonamiento CoT: ${config.cot ? "SÍ" : "NO"}
  - Salida JSON: ${config.jsonOutput ? "SÍ" : "NO"}
  - Audiencia: ${config.variables.audience || "Universal"}
  
  COHERENCIA OBLIGATORIA: El <objective> y el <workflow> y las <rules> DEBEN ser 100% coherentes. 
  Si el workflow excluye algo, el objective NO puede mencionarlo como incluido, y viceversa.
  
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

  REGLAS DE REFINAMIENTO CRÍTICAS (en orden de prioridad):

  1. COHERENCIA ENTRE SECCIONES (REGLA #1 - INVIOLABLE):
     Cuando modifiques CUALQUIER sección del prompt (<objective>, <workflow>, <rules>, etc.), 
     debes revisar TODAS las demás secciones para verificar que sigan siendo coherentes entre sí.
     Si una corrección en <workflow> cambia el alcance de una funcionalidad, DEBES actualizar 
     también <objective> y <rules> para que reflejen exactamente el mismo alcance.
     JAMAS debes dejar una sección diciendo algo diferente a otra sobre el mismo tema.

  2. PREVENCIÓN DE CONTRADICCIONES:
     Antes de finalizar, verifica que NO exista ninguna afirmación en una sección que 
     contradiga lo dicho en otra sección. Si encuentras una contradicción potencial, 
     resuélvela alineando TODAS las secciones a la misma decisión.
     Ejemplo de error a evitar: <objective> dice "personalizables" pero <workflow> dice 
     "la personalización queda fuera del alcance".

  3. PRESERVACIÓN DE CALIDAD:
     Si el prompt original ya tiene una puntuación alta (ej. >80), realiza cambios 
     QUIRÚRGICOS, no estructurales. Mantén todo lo que funciona bien.
     Tu meta es que la puntuación SUBA o se mantenga, NUNCA baje.

  4. PRIORIDAD "SUGERENCIA DE ORO":
     La sugerencia más importante de la auditoría DEBE ser incorporada de forma explícita,
     pero asegurándote de que el cambio se propague a TODAS las secciones afectadas.

  5. CORRECCIÓN HOLÍSTICA DE DEBILIDADES:
     Al corregir una debilidad, evalúa el impacto en cascada. Si eliminas algo del 
     workflow, asegúrate de que el objective, las rules, y los next_steps reflejen eso.

  6. MANTENER ARQUITECTURA MASTER:
     Conserva la estructura de tags (<role>, <objective>, <workflow>, <rules>, <next_steps>) 
     y el enfoque E-E-F (Estructura, Estética, Función).

  7. EVITAR LA REGRESIÓN:
     No diluyas instrucciones técnicas precisas. La precisión técnica es prioridad sobre la brevedad.

  8. AUTO-VERIFICACIÓN FINAL:
     Antes de devolver el prompt refinado, haz una lectura rápida verificando:
     a) ¿El <objective> es consistente con el <workflow>?
     b) ¿Las <rules> reflejan lo que el <workflow> implementa?
     c) ¿Hay alguna palabra o frase que contradiga otra parte del prompt?
     Si encuentras problemas, corrígelos antes de devolver el resultado.

  9. SALIDA LIMPIA: Devuelve SOLO el texto del prompt refinado. Sin introducciones, 
     sin comentarios, sin "Aquí tienes el prompt refinado:". Solo el prompt.

  10. IDIOMA: Mantén siempre el idioma en ESPAÑOL.`;

  return callAI({
    prompt: `PROMPT ORIGINAL:\n${prompt}\n\nINFORME DE AUDITORÍA:\n${audit}\n\nPor favor, genera el PROMPT REFINADO:`,
    systemInstruction,
    model: model
  });
}
