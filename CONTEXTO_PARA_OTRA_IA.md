# Contexto Técnico para Continuación del Proyecto "PromptMaster"

## Resumen del Estado Actual
El proyecto es una aplicación Web (React + Vite + TypeScript) para optimización de prompts usando la API de Google Gemini.
Actualmente cuenta con:
1.  **Editor de Prompts:** Interfaz principal (`src/pages/Editor.tsx`) para escribir, optimizar y guardar prompts.
2.  **Autenticación:** Firebase Auth (soporta Google y Anónimo con fallback a usuario Mock local).
3.  **Persistencia:** Firebase Firestore.

## Problema Crítico Actual
El usuario reporta un error persistente al intentar generar un prompt optimizado.

**Error Reportado:**
```
[GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent: [404 ] models/gemini-1.5-flash is not found for API version v1beta, or is not supported for generateContent.
```

**Intentos de Solución Fallidos:**
1.  Se probó `gemini-pro`: El usuario rechazó este modelo por considerarlo inferior.
2.  Se probó `gemini-1.5-flash`: Generó el error 404.
3.  Se probó `gemini-1.5-flash-002` (hardcoded): Aparentemente persiste el problema de conexión o versión.

**Requerimiento Específico del Usuario:**
El usuario solicita explícitamente usar el modelo **"Gemini 2.5 Flash"**.
*Nota Técnica:* Al momento de este escrito, Google ha lanzado "Gemini 2.0 Flash (Experimental)". Es muy probable que el usuario se refiera a `gemini-2.0-flash-exp` o similar. La próxima IA debe verificar la disponibilidad de este modelo en la librería `@google/generative-ai` versión `^0.24.1`.

## Archivos Clave

### 1. Configuración de Gemini (`src/lib/gemini.ts`)
Aquí es donde se define el modelo. Actualmente está hardcodeado a `gemini-1.5-flash-002`.

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateOptimizedPrompt(originalPrompt: string, config: any) {
  const apiKey = localStorage.getItem("gemini_api_key")?.trim();
  if (!apiKey) throw new Error("API_KEY_MISSING");

  const genAI = new GoogleGenerativeAI(apiKey);

  // AQUÍ ESTÁ EL PUNTO DE CONFLICTO
  // El usuario quiere "Gemini 2.5 Flash".
  // Se intentó 'gemini-1.5-flash' y dio 404.
  const modelName = "gemini-1.5-flash-002"; 
  console.log("Using Gemini Model (Hardcoded):", modelName);
  const model = genAI.getGenerativeModel({ model: modelName });

  // ... (resto del código de generación)
}
```

### 2. Dependencias (`package.json`)
Versiones actuales:
```json
"dependencies": {
    "@google/generative-ai": "^0.24.1",
    "firebase": "^12.9.0",
    "react": "^18.3.1",
    // ...
}
```

## Próximos Pasos Recomendados para la Siguiente IA
1.  **Validar Modelos Disponibles:** Usar `genAI.listModels()` o consultar la documentación más reciente de Google AI Studio para confirmar el string exacto del modelo "2.0 Flash" o "1.5 Flash" que funcione con la versión actual de la API (`v1beta`).
2.  **Actualizar `src/lib/gemini.ts`:** Cambiar `modelName` al string correcto (ej. `gemini-2.0-flash-exp` si es el que el usuario desea como "2.5").
3.  **Verificar API Key:** Asegurarse de que la API Key del usuario tenga permisos para los modelos beta/experimentales si se elige uno de ellos.
