import {
    Sparkles,
    Zap,
    Scale,
    Edit2,
    Copy,
    Search,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AppSidebar } from "@/components/AppSidebar"

import { useNavigate } from "react-router-dom"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { db } from "@/lib/firebase"
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore"

export default function Dashboard() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [recentPrompts, setRecentPrompts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchRecent = async () => {
            if (!user) return
            try {
                const q = query(
                    collection(db, "users", user.uid, "prompts"),
                    orderBy("createdAt", "desc"),
                    limit(5)
                )
                const querySnapshot = await getDocs(q)
                const prompts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                setRecentPrompts(prompts)
            } catch (error) {
                console.error("Error fetching recent prompts:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchRecent()
    }, [user])

    return (
        <div className="flex min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
            <AppSidebar />

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8 bg-white dark:bg-slate-950 min-h-screen">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-1">Hola, Aldo 👋</h1>
                        <p className="text-slate-500">¿Qué vamos a crear hoy?</p>
                    </div>
                    <div className="relative w-96">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input placeholder="Busca tus prompts guardados..." className="pl-10 bg-slate-50 border-slate-200 focus:bg-white transition-all" />
                    </div>
                </header>

                {/* Quick Actions */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <Card
                        onClick={() => navigate('/editor')}
                        className="hover:shadow-md transition-shadow cursor-pointer border-slate-100 dark:border-slate-800 bg-gradient-to-br from-white to-purple-50/50 dark:from-slate-900 dark:to-purple-900/10 overflow-hidden relative group"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Sparkles className="h-24 w-24 text-indigo-500" />
                        </div>
                        <CardHeader className="pb-2">
                            <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-3 text-indigo-600 dark:text-indigo-400">
                                <Sparkles className="h-6 w-6" />
                            </div>
                            <CardTitle className="text-lg text-slate-900 dark:text-slate-100">Varita Mágica</CardTitle>
                            <CardDescription className="dark:text-slate-400">Transforma ideas simples en prompts estructurados.</CardDescription>
                        </CardHeader>
                    </Card>

                    <Card
                        onClick={() => navigate('/editor')}
                        className="hover:shadow-md transition-shadow cursor-pointer border-slate-100 dark:border-slate-800 bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-900 dark:to-blue-900/10 overflow-hidden relative group"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Zap className="h-24 w-24 text-blue-500" />
                        </div>
                        <CardHeader className="pb-2">
                            <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-3 text-blue-600 dark:text-blue-400">
                                <Zap className="h-6 w-6" />
                            </div>
                            <CardTitle className="text-lg text-slate-900 dark:text-slate-100">Optimizador</CardTitle>
                            <CardDescription className="dark:text-slate-400">Mejora y refina prompts existentes automáticamente.</CardDescription>
                        </CardHeader>
                    </Card>

                    <Card
                        onClick={() => navigate('/editor', { state: { mode: 'comparator' } })}
                        className="hover:shadow-md transition-shadow cursor-pointer border-slate-100 dark:border-slate-800 bg-gradient-to-br from-white to-green-50/50 dark:from-slate-900 dark:to-green-900/10 overflow-hidden relative group"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Scale className="h-24 w-24 text-green-500" />
                        </div>
                        <CardHeader className="pb-2">
                            <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-3 text-green-600 dark:text-green-400">
                                <Scale className="h-6 w-6" />
                            </div>
                            <CardTitle className="text-lg text-slate-900 dark:text-slate-100">Comparador</CardTitle>
                            <CardDescription className="dark:text-slate-400">Prueba tu prompt en diferentes modelos.</CardDescription>
                        </CardHeader>
                    </Card>
                </section>

                {/* Recent Prompts */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-semibold text-slate-800">Recientes</h2>
                        <Button variant="link" onClick={() => navigate('/library')} className="text-indigo-600 hover:text-indigo-700">Ver todo</Button>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium">
                                <tr>
                                    <th className="px-6 py-4">Título / Idea Original</th>
                                    <th className="px-6 py-4">Creado</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {loading ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                                            Cargando prompts...
                                        </td>
                                    </tr>
                                ) : recentPrompts.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                                            No hay prompts recientes. ¡Crea el primero!
                                        </td>
                                    </tr>
                                ) : (
                                    recentPrompts.map((prompt) => (
                                        <tr
                                            key={prompt.id}
                                            className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                                            onClick={() => navigate('/editor', { state: { promptData: prompt } })}
                                        >
                                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100 max-w-xs truncate">
                                                {prompt.original}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                                                {prompt.createdAt?.toDate().toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-slate-400 hover:text-indigo-600"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate('/editor', { state: { promptData: prompt } });
                                                        }}
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-slate-400 hover:text-slate-600"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigator.clipboard.writeText(prompt.optimized || prompt.original);
                                                            alert("Copiado al portapapeles");
                                                        }}
                                                    >
                                                        <Copy className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    )
}
