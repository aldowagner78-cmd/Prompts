import { useNavigate } from "react-router-dom"
import { Copy, PenSquare, Quote, Code, Gamepad2, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AppSidebar } from "@/components/AppSidebar"

const templates = [
    {
        id: "game-design",
        title: "Diseño de Juego (Charades)",
        description: "Prompt completo para diseñar un juego de mímicas con niveles y categorías.",
        icon: Gamepad2,
        content: "Role: Game Designer Expert\nTask: Design a 'Charades' game system with the following features:\n- Multiple categories (Movies, Animals, Actions)\n- Difficulty levels (Easy, Medium, Hard)\n- Team and Solo modes\n- Scoring system mechanics\n\nOutput Format: Detailed Game Design Document (GDD) with JSON examples for card data."
    },
    {
        id: "coding-react",
        title: "Iniciador de Proyecto React",
        description: "Estructura base para una aplicación React con Vite y Tailwind.",
        icon: Code,
        content: "Role: Senior React Developer\nTask: Create a boilerplate structure for a new React application using Vite, TypeScript, and Tailwind CSS.\n\nRequirements:\n- Folder structure best practices\n- Essential dependencies list\n- Example `App.tsx` and `index.css` setup\n- ESLint and Prettier configuration suggestions."
    },
    {
        id: "email-marketing",
        title: "Campaña de Email Marketing",
        description: "Secuencia de correos para lanzamiento de producto.",
        icon: Mail,
        content: "Role: Marketing Copywriter\nTask: Write a 3-email sequence for a product launch.\n\nEmails:\n1. Teaser (coming soon)\n2. Launch Day (announcement + offer)\n3. Follow-up (social proof + scarcity)\n\nTone: Exciting, professional, and persuasive."
    },
    {
        id: "creative-writing",
        title: "Escritura Creativa",
        description: "Generador de historias basado en el viaje del héroe.",
        icon: Quote,
        content: "Role: Creative Writing Coach\nTask: Outline a short story following the 'Hero's Journey' archetype.\n\nInputs:\n- Protagonist: [Variables]\n- Setting: [Variables]\n- Conflict: [Variables]\n\nOutput: Chapter-by-chapter outline with character arc progression."
    }
]

export default function Templates() {
    const navigate = useNavigate()

    const handleUseTemplate = (content: string) => {
        // Navigate to editor with state (if we implemented context/state passing)
        // For now, we'll copy to clipboard and notify
        navigator.clipboard.writeText(content)
        alert("¡Plantilla copiada! Pégala en el Editor.")
        navigate("/editor")
    }

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
            <AppSidebar />

            <main className="flex-1 ml-64 p-8 overflow-y-auto">
                <div className="max-w-5xl mx-auto space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Plantillas</h1>
                        <p className="text-slate-500 mt-2">Arranca rápido con estos prompts pre-diseñados por expertos.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {templates.map((template) => (
                            <Card key={template.id} className="hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-3 text-indigo-600">
                                        <template.icon className="h-6 w-6" />
                                    </div>
                                    <CardTitle className="text-lg">{template.title}</CardTitle>
                                    <CardDescription>{template.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="bg-slate-50 p-3 rounded-md border border-slate-100 h-32 overflow-hidden relative">
                                        <p className="text-xs text-slate-500 font-mono whitespace-pre-wrap line-clamp-6">
                                            {template.content}
                                        </p>
                                        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-slate-50 to-transparent" />
                                    </div>
                                </CardContent>
                                <CardFooter className="gap-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => navigator.clipboard.writeText(template.content)}
                                    >
                                        <Copy className="mr-2 h-4 w-4" /> Copiar
                                    </Button>
                                    <Button
                                        className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                                        onClick={() => handleUseTemplate(template.content)}
                                    >
                                        <PenSquare className="mr-2 h-4 w-4" /> Usar
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    )
}
