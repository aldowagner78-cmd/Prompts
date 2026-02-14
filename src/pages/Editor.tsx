import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    ArrowLeft,
    Sparkles,
    Copy,
    Save,
    RefreshCw,
    Wand2,
    Loader2,
    Zap,
    Columns2,
    Rocket,
    X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function Editor() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const location = useLocation()
    const [prompt, setPrompt] = useState("")
    const [isOptimizing, setIsOptimizing] = useState(false)
    const [isComparing, setIsComparing] = useState(location.state?.mode === 'comparator' || false)

    const [optimizedPrompt, setOptimizedPrompt] = useState("")
    const [optimizedPromptB, setOptimizedPromptB] = useState("")
    const [isSaving, setIsSaving] = useState(false)
    const [isAnalyzingOriginal, setIsAnalyzingOriginal] = useState(false)
    const [isAnalyzingA, setIsAnalyzingA] = useState(false)
    const [isAnalyzingB, setIsAnalyzingB] = useState(false)
    const [isRefiningA, setIsRefiningA] = useState(false)
    const [isRefiningB, setIsRefiningB] = useState(false)
    const [auditOriginal, setAuditOriginal] = useState("")
    const [auditA, setAuditA] = useState("")
    const [auditB, setAuditB] = useState("")

    // Config State
    const [model, setModel] = useState("auto")
    const [strategy, setStrategy] = useState("auto")
    const [projectStatus, setProjectStatus] = useState<'new' | 'existing'>('new')
    const [projectPath, setProjectPath] = useState("")
    const [variables, setVariables] = useState<any>({ topic: "", context: "", tone: "auto", format: "auto", audience: "auto" })

    useEffect(() => {
        localStorage.setItem("gemini_model", model);
    }, [model]);

    // Load data from navigation state (editing from library)
    useEffect(() => {
        if (location.state?.promptData) {
            const data = location.state.promptData;
            setPrompt(data.original || "");
            setOptimizedPrompt(data.optimized || "");
            setOptimizedPromptB(data.optimizedB || "");
            setModel(data.model || "auto");
            setVariables({
                topic: data.variables?.topic || data.topic || "",
                context: data.variables?.context || data.context || "",
                tone: data.tone || "auto",
                format: data.format || "auto",
                audience: data.variables?.audience || data.audience || "auto"
            });
            setProjectStatus(data.projectStatus || 'new');
            setProjectPath(data.projectPath || "");
        }
    }, [location.state]);

    const handleOptimize = async () => {
        if (!prompt) return

        setIsOptimizing(true)

        try {
            const apiKey = localStorage.getItem("gemini_api_key")

            if (apiKey && apiKey.trim().length > 0) {
                const { generateOptimizedPrompt } = await import("@/lib/gemini")
                const configBase = {
                    cot: strategy === 'chain-of-thought',
                    strategy: strategy,
                    jsonOutput: variables.format === 'json',
                    variables: variables,
                    projectStatus: projectStatus,
                    projectPath: projectPath,
                    model: model
                }

                if (isComparing) {
                    // Parallel generation
                    const [resA, resB] = await Promise.all([
                        generateOptimizedPrompt(prompt, { ...configBase, variant: 'A' }),
                        generateOptimizedPrompt(prompt, { ...configBase, variant: 'B' })
                    ])
                    setOptimizedPrompt(resA)
                    setOptimizedPromptB(resB)
                } else {
                    const result = await generateOptimizedPrompt(prompt, configBase)
                    setOptimizedPrompt(result)
                }
            } else {
                setOptimizedPrompt(`[MOCK] Optimized Version A\nIdea: ${prompt}`)
                if (isComparing) setOptimizedPromptB(`[MOCK] Optimized Version B\nIdea: ${prompt}`)
            }
        } catch (error: any) {
            console.error("Optimize Error:", error)
            alert(`Error: ${error.message || "Verifica tu conexión."}`)
        } finally {
            setIsOptimizing(false)
        }
    }

    const handleAnalyze = async (targetText: string, targetSite: 'original' | 'A' | 'B') => {
        if (!targetText) {
            alert("No hay texto para auditar.")
            return
        }

        console.log(`Analyzing ${targetSite} with model: ${model}`);

        if (targetSite === 'original') setIsAnalyzingOriginal(true);
        else if (targetSite === 'A') setIsAnalyzingA(true);
        else setIsAnalyzingB(true);

        try {
            const { analyzePromptQuality } = await import("@/lib/gemini")
            const result = await analyzePromptQuality(targetText, model)

            if (!result) throw new Error("La auditoría regresó vacía.")

            if (targetSite === 'original') setAuditOriginal(result);
            else if (targetSite === 'A') setAuditA(result);
            else setAuditB(result);
        } catch (error: any) {
            console.error("Analysis Error:", error)
            alert(error.message || "Error fatal en la auditoría. Verifica tu API Key.")
        } finally {
            if (targetSite === 'original') setIsAnalyzingOriginal(false);
            else if (targetSite === 'A') setIsAnalyzingA(false);
            else setIsAnalyzingB(false);
        }
    }

    const handleRefineOriginal = async () => {
        if (!prompt || !auditOriginal) return;
        setIsAnalyzingOriginal(true); // Re-use state for loading
        try {
            const { refinePrompt } = await import("@/lib/gemini")
            const refined = await refinePrompt(prompt, auditOriginal, model)
            setPrompt(refined)
            setAuditOriginal("")
            alert("¡Idea original refinada con éxito!")
        } catch (error: any) {
            alert(`Error al refinar idea: ${error.message}`)
        } finally {
            setIsAnalyzingOriginal(false)
        }
    }

    const handleRefine = async (target: 'A' | 'B') => {
        const targetPrompt = target === 'A' ? optimizedPrompt : optimizedPromptB;
        const targetAudit = target === 'A' ? auditA : auditB;

        if (!targetPrompt || !targetAudit) {
            alert("Falta el prompt o el informe de auditoría.");
            return;
        }

        if (target === 'A') setIsRefiningA(true);
        else setIsRefiningB(true);

        try {
            const { refinePrompt } = await import("@/lib/gemini")
            const refined = await refinePrompt(targetPrompt, targetAudit, model)

            if (target === 'A') {
                setOptimizedPrompt(refined);
                setAuditA("");
            } else {
                setOptimizedPromptB(refined);
                setAuditB("");
            }

            alert("¡Prompt refinado con éxito incorporando las mejoras!")
        } catch (error: any) {
            console.error("Refine Error:", error)
            alert(`Error al refinar: ${error.message}`)
        } finally {
            setIsRefiningA(false);
            setIsRefiningB(false);
        }
    }

    const handleSave = async () => {
        if (!optimizedPrompt && !prompt) return
        if (!user) {
            alert("Usuario no autenticado. No se puede guardar.")
            return
        }

        setIsSaving(true)

        try {
            const saveData = {
                original: prompt,
                optimized: optimizedPrompt || prompt,
                optimizedB: optimizedPromptB,
                model: model,
                tone: variables.tone || 'auto',
                format: variables.format || 'auto',
                audience: variables.audience || 'auto',
                projectStatus: projectStatus || 'new',
                projectPath: projectStatus === 'existing' ? projectPath : '',
                settings: {
                    cot: model === 'chain-of-thought',
                    jsonOutput: variables.format === 'json'
                },
                createdAt: serverTimestamp(),
            };

            await addDoc(collection(db, "users", user.uid, "prompts"), saveData)
            alert("¡Prompt guardado en tu Biblioteca!")
        } catch (error: any) {
            console.error("Save Error:", error)
            alert(`Error al guardar: ${error.message || "Error desconocido"}`)
        } finally {
            setIsSaving(false)
        }
    }

    const handleLaunchAntigravity = (text: string) => {
        if (!text) return;

        // Create the .bat content
        const fileName = "lanzar_antigravity.bat";
        const desktopPath = "%USERPROFILE%\\Desktop\\MiProyectoAntigravity";
        const finalPath = projectStatus === 'existing' ? (projectPath || ".") : desktopPath;

        const marker = "#BEGIN_PROMPT#";
        const batHeader = `@echo off
setlocal
echo ==========================================
echo LANZANDO PROYECTO EN ANTIGRAVITY (ALDO PRO)
echo ==========================================

set "targetDir=${finalPath}"

if not exist "%targetDir%" (
    echo Creando carpeta...
    mkdir "%targetDir%"
)
cd /d "%targetDir%"

echo Generando INSTRUCCIONES.md...
:: Usamos PowerShell para extraer el prompt sin que CMD lo procese
powershell -Command "$f = [System.IO.File]::ReadAllText('%~f0'); $m = '${marker}'; $idx = $f.IndexOf($m) + $m.Length; $prompt = $f.Substring($idx).Trim(); $prompt | Set-Content -Path 'INSTRUCCIONES.md' -Encoding utf8"

echo.
echo !TODO LISTO!
echo Abriendo Antigravity en la terminal...
start powershell -NoExit -Command "echo '--- INSTRUCCIONES DE ALDO ---'; cat INSTRUCCIONES.md; echo ''; echo 'Lanzando Antigravity...'; npx antigravity ."
goto :eof

:: NO BORRAR LA LINEA SIGUIENTE
${marker}
`;
        const batContent = batHeader + text;

        const blob = new Blob([batContent], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        alert("¡Archivo .bat generado! Ejecútalo para abrir Antigravity automáticamente.");
    }

    const handleCopy = (text: string) => {
        if (!text) return
        navigator.clipboard.writeText(text)
        alert("¡Copiado al portapapeles!")
    }

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans overflow-hidden transition-colors duration-300">
            {/* Sidebar Config (Left) */}
            <aside className="w-80 border-r dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-full z-10 shadow-sm transition-all duration-300">
                <div className="p-4 border-b flex items-center gap-2">
                    <Button onClick={() => navigate('/')} variant="ghost" size="icon" className="h-8 w-8 -ml-2 text-slate-500 hover:text-slate-900">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="font-semibold text-lg tracking-tight">Editor</h1>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Project Status Selection */}
                    <div className="space-y-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <label className="text-sm font-semibold text-slate-700 block mb-2">Estado del Proyecto</label>
                        <div className="flex flex-col gap-2">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="radio"
                                    name="projectStatus"
                                    checked={projectStatus === 'new'}
                                    onChange={() => setProjectStatus('new')}
                                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-sm text-slate-600 group-hover:text-slate-900">Proyecto Nuevo (Desde cero)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="radio"
                                    name="projectStatus"
                                    checked={projectStatus === 'existing'}
                                    onChange={() => setProjectStatus('existing')}
                                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-sm text-slate-600 group-hover:text-slate-900">Proyecto Existente</span>
                            </label>
                        </div>

                        {projectStatus === 'existing' && (
                            <div className="mt-3 space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                <label className="text-xs font-medium text-slate-500 uppercase">Ruta del Proyecto</label>
                                <Input
                                    placeholder="C:\Ruta\Al\Proyecto..."
                                    className="h-8 text-sm bg-white"
                                    value={projectPath}
                                    onChange={(e) => setProjectPath(e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    {/* Strategy Selection */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estrategia de Prompt</label>
                        <Select value={strategy} onValueChange={setStrategy}>
                            <SelectTrigger className="w-full h-10 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl">
                                <SelectValue placeholder="Selecciona estrategia" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="auto">✨ Automático (Recomendado)</SelectItem>
                                <SelectItem value="zero-shot">Directo (Zero-shot)</SelectItem>
                                <SelectItem value="few-shot">Con Ejemplos (Few-shot)</SelectItem>
                                <SelectItem value="chain-of-thought">Cadena de Pensamiento (CoT)</SelectItem>
                                <SelectItem value="role-playing">Role Playing (Actuar como)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Modelo de IA</label>
                            <Select value={model} onValueChange={setModel}>
                                <SelectTrigger className="h-10 text-sm border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl">
                                    <SelectValue placeholder="Modelo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="auto">🤖 Recomendado (Gemini 2.5 Flash)</SelectItem>
                                    <SelectItem value="gemini-2.5-flash">⚡ Gemini 2.5 Flash (Master)</SelectItem>
                                    <SelectItem value="gemini-1.5-pro">🧠 Gemini 1.5 Pro</SelectItem>
                                    <SelectItem value="gemini-1.5-flash">⚡ Gemini 1.5 Flash</SelectItem>
                                    <SelectItem value="llama-3.1-70b-versatile">🦙 Llama 3.1 70B (Groq)</SelectItem>
                                    <SelectItem value="llama-3.1-8b-instant">⚡ Llama 3.1 8B (Groq)</SelectItem>
                                    <SelectItem value="mixtral-8x7b-32768">🌀 Mixtral 8x7b (Groq)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Audiencia Objetivo</label>
                            <Select value={variables.audience} onValueChange={(v) => setVariables({ ...variables, audience: v })}>
                                <SelectTrigger className="h-10 text-sm border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl">
                                    <SelectValue placeholder="Audiencia" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="auto">✨ Universal</SelectItem>
                                    <SelectItem value="professional">⚖️ Profesional</SelectItem>
                                    <SelectItem value="technical">💻 Técnico / IT</SelectItem>
                                    <SelectItem value="creative">🎨 Creativo</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Variables */}
                    <Accordion type="single" collapsible defaultValue="variables" className="w-full border rounded-2xl bg-slate-50/30 dark:bg-slate-800/10 overflow-hidden">
                        <AccordionItem value="variables" className="border-b-0">
                            <AccordionTrigger className="text-xs font-bold py-3 px-4 uppercase text-slate-500">Variables</AccordionTrigger>
                            <AccordionContent className="px-4 pb-4">
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-medium text-slate-400 uppercase">topic</label>
                                        <Input
                                            className="h-8 text-xs rounded-lg"
                                            value={variables.topic}
                                            onChange={(e) => setVariables({ ...variables, topic: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-medium text-slate-400 uppercase">context</label>
                                        <Input
                                            className="h-8 text-xs rounded-lg"
                                            value={variables.context || ""}
                                            onChange={(e) => setVariables({ ...variables, context: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>

                <div className="p-6 border-t dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-3">
                    <Button
                        onClick={() => setIsComparing(!isComparing)}
                        variant={isComparing ? "secondary" : "outline"}
                        className={`w-full border-indigo-100 transition-all rounded-xl h-10 text-xs font-bold ${isComparing ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'text-indigo-700'}`}
                    >
                        <Columns2 className="mr-2 h-4 w-4" />
                        {isComparing ? "COMPARADOR ON" : "ACTIVAR COMPARADOR"}
                    </Button>
                    <Button
                        onClick={handleOptimize}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-100 dark:shadow-none transition-all active:scale-95 rounded-xl h-11 font-black tracking-tight"
                        disabled={!prompt || isOptimizing}
                    >
                        {isOptimizing ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> GENERANDO...</>
                        ) : (
                            <><Wand2 className="mr-2 h-4 w-4" /> ¡OPTIMIZAR AHORA!</>
                        )}
                    </Button>
                    <Button
                        onClick={handleSave}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg transition-all active:scale-95 rounded-xl h-11 font-bold flex items-center justify-center gap-2"
                        disabled={isSaving || (!prompt && !optimizedPrompt)}
                    >
                        <Save className={`${isSaving ? 'animate-spin' : ''} h-4 w-4`} />
                        {isSaving ? 'GUARDANDO...' : 'GUARDAR EN BIBLIOTECA'}
                    </Button>
                </div>
            </aside>

            {/* Main Surface */}
            <main className="flex-1 flex h-[calc(100vh-3.5rem)] overflow-hidden bg-slate-50 dark:bg-slate-950">
                {/* Input Panel */}
                <div className={`flex flex-col border-r dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-500 ease-in-out ${isComparing ? 'w-1/3' : 'w-1/2'}`}>
                    <div className="h-14 border-b dark:border-slate-800 flex items-center justify-between px-6 bg-slate-50/50 dark:bg-slate-800/20">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Cerebro del Prompt</label>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-[10px] font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg"
                            onClick={() => handleAnalyze(prompt, 'original')}
                            disabled={isAnalyzingOriginal || !prompt}
                        >
                            {isAnalyzingOriginal ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
                            AUDITAR IDEA
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 relative scroll-smooth bg-white dark:bg-slate-900 shadow-inner">
                        <div className="flex flex-col gap-4 min-h-full">
                            <Textarea
                                placeholder="Ej: Crea una aplicación para médicos que automatice la transcripción..."
                                className="min-h-[400px] w-full resize-none border-0 focus-visible:ring-0 p-0 text-xl leading-relaxed placeholder:text-slate-200 dark:placeholder:text-slate-700 bg-transparent text-slate-800 dark:text-slate-200 font-medium whitespace-pre-wrap"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                            />

                            {/* Audit Original Panel */}
                            {auditOriginal && (
                                <div className="mt-auto pt-8 pb-4">
                                    <div className="p-6 bg-indigo-50/80 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 animate-in slide-in-from-bottom-4 duration-300 shadow-lg backdrop-blur-sm z-10">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-[10px] font-black text-indigo-900 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                                <Sparkles className="h-3 w-3" /> Revisión Predictiva
                                            </h4>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 px-3 text-[9px] font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg"
                                                    onClick={handleRefineOriginal}
                                                >
                                                    REINCORPORAR MEJORAS
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => setAuditOriginal("")}>
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                        <pre className="text-xs text-indigo-800 dark:text-indigo-300 whitespace-pre-wrap font-sans leading-relaxed">
                                            {auditOriginal}
                                        </pre>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Output Panel */}
                <div className="flex-1 min-w-0 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
                    <div className={`flex-1 flex overflow-hidden h-full transition-all duration-500 ease-in-out ${isComparing ? 'flex-row gap-4 p-4' : 'flex-col p-8'}`}>
                        {/* Versión A */}
                        <div className={`flex flex-col min-h-0 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl shadow-indigo-100/50 dark:shadow-none transition-all duration-700 ease-in-out flex-1 ${!isComparing && 'w-full ring-2 ring-indigo-500/20 ring-offset-4 ring-offset-white dark:ring-offset-slate-950 shadow-indigo-100'}`}>
                            <div className="px-6 py-4 border-b dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                                <span className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                                    Versión A {isComparing && "(Master)"}
                                    {auditA && <span className="ml-2 px-1.5 py-0.5 bg-indigo-100 text-indigo-600 rounded text-[8px]">AUDITORÍA LISTA</span>}
                                </span>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 px-4 text-[10px] font-bold gap-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded-xl"
                                        onClick={() => handleAnalyze(optimizedPrompt, 'A')}
                                        disabled={isAnalyzingA || !optimizedPrompt}
                                    >
                                        {isAnalyzingA ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />} AUDITAR
                                    </Button>
                                    <Button
                                        variant="default"
                                        size="sm"
                                        className="h-8 px-5 text-[10px] font-black gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200"
                                        onClick={() => handleLaunchAntigravity(optimizedPrompt)}
                                        disabled={!optimizedPrompt}
                                    >
                                        <Rocket className="h-3.5 w-3.5" /> EJECUTAR
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" onClick={() => handleCopy(optimizedPrompt)}>
                                        <Copy className="h-3.5 w-3.5 text-slate-300 hover:text-indigo-500" />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-10 scroll-smooth relative">
                                {optimizedPrompt ? (
                                    <div className="space-y-12">
                                        <div className="relative">
                                            <pre className="whitespace-pre-wrap font-mono text-sm text-slate-700 dark:text-slate-300 animate-in fade-in slide-in-from-bottom-2 duration-700 leading-[1.8] selection:bg-indigo-600 selection:text-white">
                                                {optimizedPrompt}
                                            </pre>
                                        </div>

                                        {/* Audit Panel A - MOVIDO FUERA DEL PROSE Y CON Z-INDEX */}
                                        {auditA && (
                                            <div className="relative p-7 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-3xl border-2 border-indigo-200 dark:border-indigo-800 animate-in slide-in-from-bottom-8 duration-500 shadow-2xl backdrop-blur-md z-20">
                                                <div className="flex justify-between items-center mb-5">
                                                    <h4 className="text-[10px] font-black text-indigo-900 dark:text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                                        <Sparkles className="h-3 w-3 text-indigo-500" /> REPORTE DE AUDITORÍA V.A
                                                    </h4>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="default"
                                                            size="sm"
                                                            className="h-8 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black rounded-xl shadow-lg"
                                                            onClick={() => handleRefine('A')}
                                                            disabled={isRefiningA}
                                                        >
                                                            {isRefiningA ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Wand2 className="h-3 w-3 mr-1" />}
                                                            APLICAR SUGERENCIAS
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setAuditA("")}>
                                                            <X className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="text-xs text-indigo-900 dark:text-indigo-200 whitespace-pre-wrap font-sans leading-relaxed border-l-4 border-indigo-500 pl-6 bg-white/50 dark:bg-black/30 p-6 rounded-2xl shadow-inner">
                                                    {auditA}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-200 opacity-30 select-none">
                                        <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[3rem] mb-6">
                                            <Wand2 className="h-16 w-16" />
                                        </div>
                                        <p className="text-sm font-black tracking-[0.3em] uppercase">Ready for Ignition</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Versión B (Comparator) */}
                        {isComparing && (
                            <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900 rounded-[2rem] border border-purple-100 dark:border-purple-950 shadow-2xl shadow-purple-100/30 dark:shadow-none animate-in slide-in-from-right-12 duration-700 ease-out">
                                <div className="px-6 py-4 border-b dark:border-slate-800 bg-purple-50/20 dark:bg-purple-900/10 flex items-center justify-between">
                                    <span className="text-[10px] font-black text-purple-500 dark:text-purple-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Zap className="h-3.5 w-3.5" />
                                        Versión B (Creativa)
                                        {auditB && <span className="ml-2 px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded text-[8px]">AUDITORÍA LISTA</span>}
                                    </span>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 px-4 text-[10px] font-bold gap-2 border-purple-200 text-purple-600 hover:bg-purple-50 rounded-xl"
                                            onClick={() => handleAnalyze(optimizedPromptB, 'B')}
                                            disabled={isAnalyzingB || !optimizedPromptB}
                                        >
                                            {isAnalyzingB ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />} AUDITAR
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" onClick={() => handleLaunchAntigravity(optimizedPromptB)}>
                                            <Rocket className="h-3.5 w-3.5 text-purple-400" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" onClick={() => handleCopy(optimizedPromptB)}>
                                            <Copy className="h-3.5 w-3.5 text-slate-300" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-10 scroll-smooth relative">
                                    {optimizedPromptB ? (
                                        <div className="space-y-12">
                                            <pre className="whitespace-pre-wrap font-mono text-sm text-slate-700 dark:text-slate-300 animate-in fade-in slide-in-from-bottom-4 duration-700 leading-[1.8]">
                                                {optimizedPromptB}
                                            </pre>

                                            {/* Audit Panel B */}
                                            {auditB && (
                                                <div className="relative p-7 bg-purple-50/50 dark:bg-purple-900/10 rounded-3xl border-2 border-purple-100 dark:border-purple-900/30 animate-in slide-in-from-bottom-8 duration-500 shadow-2xl backdrop-blur-md z-20">
                                                    <div className="flex justify-between items-center mb-5">
                                                        <h4 className="text-[10px] font-black text-purple-900 dark:text-purple-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                                            <Sparkles className="h-3.5 w-3.5 text-purple-500" /> REPORTE DE AUDITORÍA V.B
                                                        </h4>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                variant="default"
                                                                size="sm"
                                                                className="h-8 px-5 bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-black rounded-xl"
                                                                onClick={() => handleRefine('B')}
                                                                disabled={isRefiningB}
                                                            >
                                                                {isRefiningB ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Wand2 className="h-3 w-3 mr-1" />}
                                                                APLICAR SUGERENCIAS
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setAuditB("")}>
                                                                <X className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-purple-900 dark:text-purple-200 whitespace-pre-wrap font-sans leading-relaxed border-l-4 border-purple-500 pl-6 bg-white/50 dark:bg-black/30 p-6 rounded-2xl shadow-inner">
                                                        {auditB}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-200 opacity-20 select-none">
                                            <RefreshCw className={`h-16 w-16 ${isOptimizing ? 'animate-spin text-purple-500' : ''}`} />
                                            <p className="mt-8 text-[10px] font-black tracking-[0.4em] uppercase">Standby for Signal</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
