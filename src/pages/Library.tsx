import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
    Search,
    Filter,
    MoreHorizontal,
    Copy,
    Trash2,
    Edit3,
    Calendar,
    Sparkles,
    Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AppSidebar } from "@/components/AppSidebar"
import { useAuth } from "@/contexts/AuthContext"
import { db } from "@/lib/firebase"
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore"

interface Prompt {
    id: string
    original: string
    optimized: string
    model: string
    createdAt: any
    settings: {
        cot: boolean
        jsonOutput: boolean
    }
}

export default function Library() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [searchTerm, setSearchTerm] = useState("")
    const [prompts, setPrompts] = useState<Prompt[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) return

        const q = query(
            collection(db, "users", user.uid, "prompts"),
            orderBy("createdAt", "desc")
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedPrompts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Prompt[]
            setPrompts(fetchedPrompts)
            setLoading(false)
        }, (error) => {
            console.error("Error fetching prompts:", error)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [user])

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this prompt?")) {
            try {
                await deleteDoc(doc(db, "users", user!.uid, "prompts", id))
            } catch (error) {
                console.error("Error deleting prompt:", error)
            }
        }
    }

    const filteredPrompts = prompts.filter(prompt =>
        prompt.original.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prompt.optimized.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleEdit = (prompt: Prompt) => {
        navigate('/editor', { state: { promptData: prompt } })
    }

    return (
        <div className="flex h-screen bg-slate-50 font-sans">
            <AppSidebar />

            <main className="flex-1 overflow-y-auto ml-64">
                <div className="max-w-6xl mx-auto p-8 space-y-8">

                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Biblioteca</h1>
                            <p className="text-slate-500 mt-1">Gestiona y reutiliza tus prompts guardados.</p>
                        </div>
                        <Button onClick={() => navigate('/editor')} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                            <Sparkles className="mr-2 h-4 w-4" /> Nuevo Prompt
                        </Button>
                    </div>

                    {/* Filters & Search */}
                    <div className="flex gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Buscar prompts..."
                                className="pl-10 bg-white shadow-sm border-slate-200"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" className="text-slate-600 border-slate-200">
                            <Filter className="mr-2 h-4 w-4" /> Filtros
                        </Button>
                    </div>

                    {/* Grid */}
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                        </div>
                    ) : filteredPrompts.length === 0 ? (
                        <div className="text-center py-20 text-slate-500">
                            No se encontraron prompts. ¡Crea uno nuevo!
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredPrompts.map((prompt) => (
                                <div key={prompt.id} className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
                                    <div
                                        className="p-5 flex-1 space-y-4 cursor-pointer"
                                        onClick={() => handleEdit(prompt)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 uppercase tracking-wider text-[10px]">
                                                {prompt.model}
                                            </Badge>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 -mt-1 -mr-2 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => {
                                                        navigator.clipboard.writeText(prompt.optimized);
                                                        alert("¡Copiado!");
                                                    }}>
                                                        <Copy className="mr-2 h-4 w-4" /> Copiar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleEdit(prompt)}>
                                                        <Edit3 className="mr-2 h-4 w-4" /> Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(prompt.id);
                                                    }} className="text-red-600 focus:text-red-700 focus:bg-red-50">
                                                        <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <div>
                                            <h3 className="font-semibold text-slate-900 line-clamp-1 mb-1">
                                                {prompt.original.substring(0, 50) || "Sin título"}
                                            </h3>
                                            <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed">
                                                {prompt.optimized}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="px-5 py-3 border-t bg-slate-50/50 flex items-center justify-between text-xs text-slate-400">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            <span>{prompt.createdAt?.toDate().toLocaleDateString() || "Hoy"}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 hover:text-indigo-600"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(prompt.optimized);
                                                    alert("¡Copiado!");
                                                }}
                                            >
                                                <Copy className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 hover:text-indigo-600"
                                                onClick={() => handleEdit(prompt)}
                                            >
                                                <Edit3 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                    }
                </div >
            </main >
        </div >
    )
}
