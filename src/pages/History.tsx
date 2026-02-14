import { useState, useEffect } from "react"
import { History as HistoryIcon, Clock, FileText, Copy } from "lucide-react"
import { AppSidebar } from "@/components/AppSidebar"
import { useAuth } from "@/contexts/AuthContext"
import { db } from "@/lib/firebase"
import { collection, query, orderBy, onSnapshot } from "firebase/firestore"
import { Button } from "@/components/ui/button"

interface Log {
    id: string
    original: string
    optimized: string
    model: string
    createdAt: any
}

export default function History() {
    const { user } = useAuth()
    const [logs, setLogs] = useState<Log[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) return

        // Ideally this would be a separate 'logs' collection, but we'll use 'prompts' for now
        // to show meaningful data immediately.
        const q = query(
            collection(db, "users", user.uid, "prompts"),
            orderBy("createdAt", "desc")
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedLogs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Log[]
            setLogs(fetchedLogs)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [user])

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
            <AppSidebar />

            <main className="flex-1 ml-64 p-8 bg-slate-50 dark:bg-slate-950 overflow-y-auto">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <HistoryIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" /> Historial
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">Registro cronológico de tus actividades recientes.</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        {loading ? (
                            <div className="p-8 text-center text-slate-500 dark:text-slate-400">Cargando historial...</div>
                        ) : logs.length === 0 ? (
                            <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                                <Clock className="h-12 w-12 mx-auto mb-3 opacity-20 dark:opacity-10" />
                                <p>No hay actividad reciente.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {logs.map((log) => (
                                    <div key={log.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center gap-4 group">
                                        <div className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                                                Prompt Guardado: "{log.original}"
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                                <span>{log.createdAt?.toDate().toLocaleString()}</span>
                                                <span>•</span>
                                                <span className="uppercase tracking-wider text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400">{log.model}</span>
                                            </p>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => navigator.clipboard.writeText(log.optimized)} className="dark:hover:bg-slate-800">
                                            <Copy className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
