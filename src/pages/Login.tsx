import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { Sparkles, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInAnonymously } from "firebase/auth"
import { auth } from "@/lib/firebase"

export default function Login() {
    const { signInWithGoogle } = useAuth()
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [isSignUp, setIsSignUp] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleGoogleLogin = async () => {
        setIsLoading(true)
        setError("")
        try {
            await signInWithGoogle()
            navigate("/")
        } catch (err: any) {
            const errorMessage = err?.message || "Error desconocido";
            const errorCode = err?.code || "No code";
            setError(`Google Error: ${errorMessage} (${errorCode})`);
            console.error("Login Error:", err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            if (isSignUp) {
                await createUserWithEmailAndPassword(auth, email, password)
            } else {
                await signInWithEmailAndPassword(auth, email, password)
            }
            navigate("/")
        } catch (err: any) {
            const errorMessage = err?.message || "Error desconocido";
            const errorCode = err?.code || "No code";
            setError(`Email Error: ${errorMessage} (${errorCode})`);
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 font-sans">
            <Card className="w-full max-w-md p-8 bg-white shadow-xl border-slate-200">
                <div className="flex flex-col items-center mb-8">
                    <div className="h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-200">
                        <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        {isSignUp ? "Crear Cuenta" : "Bienvenido a PromptMaster"}
                    </h1>
                    <p className="text-slate-500 text-center mt-2">
                        {isSignUp ? "Regístrate para comenzar a crear prompts." : "Inicia sesión para gestionar tus prompts."}
                    </p>
                </div>

                {error && (
                    <Alert variant="destructive" className="mb-6 bg-red-50 text-red-600 border-red-100">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="space-y-4">
                    <Button
                        variant="outline"
                        type="button"
                        disabled={isLoading}
                        className="w-full h-11 border-slate-200 hover:bg-slate-50 hover:text-slate-900 font-medium"
                        onClick={handleGoogleLogin}
                    >
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                            </svg>
                        )}
                        Continuar con Google
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-slate-500">O continúa con email</span>
                        </div>
                    </div>

                    <form onSubmit={handleEmailAuth} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="tu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>
                        <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSignUp ? "Registrarse" : "Iniciar Sesión"}
                        </Button>
                    </form>

                    <div className="text-center text-sm">
                        <button
                            type="button"
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-indigo-600 hover:underline font-medium"
                        >
                            {isSignUp ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate"}
                        </button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-slate-500">O prueba sin cuenta</span>
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        type="button"
                        onClick={async () => {
                            setIsLoading(true);
                            try {
                                await signInAnonymously(auth);
                                navigate("/");
                            } catch (err: any) {
                                setError(`Anon Error: ${err.message} (${err.code})`);
                            } finally {
                                setIsLoading(false);
                            }
                        }}
                        className="w-full text-slate-500 hover:text-slate-900"
                    >
                        Continuar como Invitado
                    </Button>
                </div>
            </Card>
        </div>
    )
}
