import {
    LayoutDashboard,
    Library,
    History,
    Settings,
    Sparkles,
    Plus,
    Copy,
    HelpCircle,
    Moon,
    Sun,
    LogOut
} from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "@/contexts/ThemeContext"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sidebar } from "@/components/ui/sidebar"

export function AppSidebar() {
    const navigate = useNavigate()
    const location = useLocation()
    const { user, logout } = useAuth()
    const { theme, setTheme } = useTheme()

    const handleLogout = async () => {
        try {
            await logout()
            navigate("/login")
        } catch (error) {
            console.error("Failed to log out", error)
        }
    }

    return (
        <Sidebar className="w-64 border-r bg-slate-50/50 dark:bg-slate-900 dark:border-slate-800 flex flex-col justify-between fixed h-full">
            <div className="space-y-4 py-4 px-3">
                <div className="px-3 py-2 flex items-center gap-2 mb-4">
                    <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                        PromptMaster
                    </h2>
                </div>

                <div className="px-3">
                    <Button
                        onClick={() => navigate('/editor')}
                        className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-sm transition-all duration-200"
                        size="lg"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Nuevo Prompt
                    </Button>
                </div>

                <div className="py-2">
                    <nav className="space-y-1 px-2">
                        <Button
                            variant={location.pathname === '/' ? "secondary" : "ghost"}
                            className={`w-full justify-start ${location.pathname === '/' ? "text-indigo-700 bg-indigo-50 font-medium dark:bg-indigo-900/20 dark:text-indigo-300" : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"}`}
                            onClick={() => navigate('/')}
                        >
                            <LayoutDashboard className="mr-3 h-4 w-4" />
                            Panel
                        </Button>
                        <Button
                            variant={location.pathname === '/library' ? "secondary" : "ghost"}
                            className={`w-full justify-start ${location.pathname === '/library' ? "text-indigo-700 bg-indigo-50 font-medium dark:bg-indigo-900/20 dark:text-indigo-300" : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"}`}
                            onClick={() => navigate('/library')}
                        >
                            <Library className="mr-3 h-4 w-4" />
                            Biblioteca
                        </Button>
                        <Button
                            variant={location.pathname === '/templates' ? "secondary" : "ghost"}
                            className={`w-full justify-start ${location.pathname === '/templates' ? "text-indigo-700 bg-indigo-50 font-medium dark:bg-indigo-900/20 dark:text-indigo-300" : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"}`}
                            onClick={() => navigate('/templates')}
                        >
                            <Copy className="mr-3 h-4 w-4" />
                            Plantillas
                        </Button>
                        <Button
                            variant={location.pathname === '/history' ? "secondary" : "ghost"}
                            className={`w-full justify-start ${location.pathname === '/history' ? "text-indigo-700 bg-indigo-50 font-medium dark:bg-indigo-900/20 dark:text-indigo-300" : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"}`}
                            onClick={() => navigate('/history')}
                        >
                            <History className="mr-3 h-4 w-4" />
                            Historial
                        </Button>
                        <Button
                            variant={location.pathname === '/help' ? "secondary" : "ghost"}
                            className={`w-full justify-start ${location.pathname === '/help' ? "text-indigo-700 bg-indigo-50 font-medium dark:bg-indigo-900/20 dark:text-indigo-300" : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"}`}
                            onClick={() => navigate('/help')}
                        >
                            <HelpCircle className="mr-3 h-4 w-4" />
                            Ayuda
                        </Button>
                        <Button
                            variant={location.pathname === '/settings' ? "secondary" : "ghost"}
                            className={`w-full justify-start ${location.pathname === '/settings' ? "text-indigo-700 bg-indigo-50 font-medium dark:bg-indigo-900/20 dark:text-indigo-300" : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"}`}
                            onClick={() => navigate('/settings')}
                        >
                            <Settings className="mr-3 h-4 w-4" />
                            Ajustes
                        </Button>
                        <div className="pt-2">
                            <Button
                                variant="ghost"
                                className="w-full justify-start text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            >
                                {theme === "dark" ? (
                                    <><Sun className="mr-3 h-4 w-4" /> Modo Claro</>
                                ) : (
                                    <><Moon className="mr-3 h-4 w-4" /> Modo Oscuro</>
                                )}
                            </Button>
                        </div>
                    </nav>
                </div>
            </div>

            <div className="p-4 border-t bg-slate-50/50 space-y-2">
                <div className="flex items-center gap-3 w-full p-2 rounded-lg bg-indigo-50/50 dark:bg-slate-900 border border-indigo-100 dark:border-slate-800">
                    <Avatar className="h-9 w-9 border border-indigo-200">
                        <AvatarImage src={user?.photoURL || ""} />
                        <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold">YO</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 flex flex-col text-left overflow-hidden">
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">Modo Personal</span>
                        <span className="text-xs text-indigo-600 dark:text-indigo-400 truncate flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                            Online
                        </span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={handleLogout}>
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </Sidebar>
    )
}
