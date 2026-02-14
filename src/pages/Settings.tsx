import { useState, useEffect } from "react"
import { Save, Key, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AppSidebar } from "@/components/AppSidebar"
import { callAI } from "@/lib/ai"

export default function Settings() {
    const [apiKey, setApiKey] = useState("")
    const [groqApiKey, setGroqApiKey] = useState("")
    const [isSaved, setIsSaved] = useState(false)
    const [isGroqSaved, setIsGroqSaved] = useState(false)

    const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle")
    const [testMessage, setTestMessage] = useState("")
    const [groqTestStatus, setGroqTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle")
    const [groqTestMessage, setGroqTestMessage] = useState("")

    useEffect(() => {
        const storedKey = localStorage.getItem("gemini_api_key")
        if (storedKey) setApiKey(storedKey)
        const storedGroq = localStorage.getItem("groq_api_key")
        if (storedGroq) setGroqApiKey(storedGroq)
    }, [])

    const handleSave = () => {
        const cleanedKey = apiKey.trim()
        setApiKey(cleanedKey)
        localStorage.setItem("gemini_api_key", cleanedKey)
        setIsSaved(true)
        setTestStatus("idle")
        setTestMessage("")
        setTimeout(() => setIsSaved(false), 3000)
    }

    const handleGroqSave = () => {
        const cleanedKey = groqApiKey.trim()
        setGroqApiKey(cleanedKey)
        localStorage.setItem("groq_api_key", cleanedKey)
        setIsGroqSaved(true)
        setGroqTestStatus("idle")
        setGroqTestMessage("")
        setTimeout(() => setIsGroqSaved(false), 3000)
    }

    const handleTestGemini = async () => {
        setTestStatus("testing")
        setTestMessage("Probando conexión...")
        try {
            await callAI({
                prompt: "Responde solo con 'OK'",
                provider: 'gemini',
                model: 'gemini-1.5-flash'
            })
            setTestStatus("success")
            setTestMessage("¡Conexión Gemini exitosa!")
        } catch (error: unknown) {
            setTestStatus("error")
            const msg = error instanceof Error ? error.message : "Error desconocido"
            setTestMessage(msg.includes("429") ? "Límite de cuota (429)" : msg)
        }
    }

    const handleTestGroq = async () => {
        setGroqTestStatus("testing")
        setGroqTestMessage("Probando conexión...")
        try {
            await callAI({
                prompt: "Responde solo con 'OK'",
                provider: 'groq',
                model: 'llama-3.1-8b-instant'
            })
            setGroqTestStatus("success")
            setGroqTestMessage("¡Conexión Groq exitosa!")
        } catch (error: unknown) {
            setGroqTestStatus("error")
            const msg = error instanceof Error ? error.message : "Error desconocido"
            setGroqTestMessage(msg.includes("429") ? "Límite de cuota Groq" : msg)
        }
    }

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
            <AppSidebar />

            <main className="flex-1 ml-64 p-8 overflow-y-auto">
                <div className="max-w-2xl mx-auto space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Ajustes</h1>
                        <p className="text-slate-500 mt-2">Configura tus proveedores de IA para evitar bloqueos.</p>
                    </div>

                    <div className="grid gap-6">
                        {/* Gemini Card */}
                        <Card className="border-slate-200">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-indigo-900">
                                    <Key className="h-5 w-5 text-indigo-600" />
                                    Google Gemini (Estándar)
                                </CardTitle>
                                <CardDescription>
                                    Recomendado para auditorías detalladas (2.5 Flash).
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Alert className="bg-indigo-50 border-indigo-100 py-2">
                                    <AlertCircle className="h-4 w-4 text-indigo-600" />
                                    <AlertDescription className="text-xs text-indigo-800">
                                        Llave gratis en <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="font-bold underline">Google AI Studio</a>.
                                    </AlertDescription>
                                </Alert>

                                <div className="space-y-3">
                                    <Input
                                        type="password"
                                        placeholder="API Key de Gemini..."
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        className="font-mono h-10"
                                    />
                                    <div className="flex gap-2">
                                        <Button onClick={handleSave} className="flex-1 h-10 bg-indigo-600 hover:bg-indigo-700">
                                            {isSaved ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                                            {isSaved ? "Guardado" : "Guardar Gemini"}
                                        </Button>
                                        <Button variant="outline" size="icon" className="h-10 w-10" onClick={handleTestGemini} disabled={testStatus === "testing" || !apiKey}>
                                            <RefreshCw className={`h-4 w-4 ${testStatus === "testing" ? "animate-spin" : ""}`} />
                                        </Button>
                                    </div>
                                    {testStatus !== "idle" && (
                                        <p className={`text-xs flex items-center gap-1 ${testStatus === "success" ? "text-green-600" : "text-red-500"}`}>
                                            {testStatus === "success" ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                                            {testMessage}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Groq Card */}
                        <Card className="border-slate-200">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-orange-900">
                                    <Key className="h-5 w-5 text-orange-600" />
                                    Groq (Respaldo Ultra-Rápido)
                                </CardTitle>
                                <CardDescription>
                                    Gratis e instantáneo. Úsalo cuando Gemini se bloquee por cuota.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Alert className="bg-orange-50 border-orange-100 py-2">
                                    <AlertCircle className="h-4 w-4 text-orange-600" />
                                    <AlertDescription className="text-xs text-orange-800">
                                        Llave gratis en <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="font-bold underline">Groq Console</a>.
                                    </AlertDescription>
                                </Alert>

                                <div className="space-y-3">
                                    <Input
                                        type="password"
                                        placeholder="gsk_..."
                                        value={groqApiKey}
                                        onChange={(e) => setGroqApiKey(e.target.value)}
                                        className="font-mono h-10"
                                    />
                                    <div className="flex gap-2">
                                        <Button onClick={handleGroqSave} className="flex-1 h-10 bg-orange-600 hover:bg-orange-700">
                                            {isGroqSaved ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                                            {isGroqSaved ? "Guardado" : "Guardar Groq"}
                                        </Button>
                                        <Button variant="outline" size="icon" className="h-10 w-10" onClick={handleTestGroq} disabled={groqTestStatus === "testing" || !groqApiKey}>
                                            <RefreshCw className={`h-4 w-4 ${groqTestStatus === "testing" ? "animate-spin" : ""}`} />
                                        </Button>
                                    </div>
                                    {groqTestStatus !== "idle" && (
                                        <p className={`text-xs flex items-center gap-1 ${groqTestStatus === "success" ? "text-green-600" : "text-red-500"}`}>
                                            {groqTestStatus === "success" ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                                            {groqTestMessage}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}

