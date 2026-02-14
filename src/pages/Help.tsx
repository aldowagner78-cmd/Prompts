import {
    HelpCircle,
    Sparkles,
    Library,
    Copy,
    Edit,
    Zap,
    Columns2
} from "lucide-react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { AppSidebar } from "@/components/AppSidebar"

export default function Help() {
    return (
        <div className="flex h-screen bg-slate-50 font-sans">
            <AppSidebar />

            <main className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto p-8 space-y-8">

                    {/* Header */}
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                            <HelpCircle className="h-8 w-8 text-indigo-600" />
                            Manual de Ayuda
                        </h1>
                        <p className="text-slate-500 text-lg">
                            Aprende a sacar el máximo provecho de PromptMaster y crea prompts profesionales en segundos.
                        </p>
                    </div>

                    {/* Quick Start Guide */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="hover:border-indigo-200 transition-colors">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-indigo-600" />
                                    Varita Mágica (Editor)
                                </CardTitle>
                                <CardDescription>Transforma ideas simples en prompts estructurados.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <p className="text-sm text-slate-600">
                                    1. Ve al <strong>Editor</strong> y escribe tu idea básica en el panel central (ej: "Correo de ventas").
                                </p>
                                <p className="text-sm text-slate-600">
                                    2. Pulsa <strong>GENERAR PROMPT!</strong> para que la IA cree una versión detallada y profesional.
                                </p>
                                <p className="text-sm text-slate-600">
                                    3. Selecciona el <strong>Estado del Proyecto</strong> (Nuevo o Existente) para adaptar el contexto.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="hover:border-indigo-200 transition-colors">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-indigo-700">
                                    <Zap className="h-5 w-5" />
                                    Optimizador (Revisión)
                                </CardTitle>
                                <CardDescription>Audita la calidad de tus prompts antes de usarlos.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <p className="text-sm text-slate-600">
                                    1. Pulsa el botón <strong>REVISIÓN DE CALIDAD</strong> en el menú lateral del Editor.
                                </p>
                                <p className="text-sm text-slate-600">
                                    2. La IA analizará claridad, contexto y precisión, asignando una <strong>puntuación (0-100)</strong>.
                                </p>
                                <p className="text-sm text-slate-600">
                                    3. Sigue la <strong>"Sugerencia de Oro"</strong> para mejorar las debilidades detectadas.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="hover:border-indigo-200 transition-colors">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-indigo-700">
                                    <Columns2 className="h-5 w-5" />
                                    Comparador A/B
                                </CardTitle>
                                <CardDescription>Genera y compara dos variantes distintas simultáneamente.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <p className="text-sm text-slate-600">
                                    1. Activa el icono de columnas <Columns2 className="h-3 w-3 inline text-indigo-500" /> arriba a la derecha.
                                </p>
                                <p className="text-sm text-slate-600">
                                    2. La <strong>Versión A</strong> seguirá un formato estándar, mientras que la <strong>Versión B</strong> será más creativa y detallada.
                                </p>
                                <p className="text-sm text-slate-600">
                                    3. Compara ambos resultados lado a lado y copia el que mejor funcione para tu caso.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="hover:border-indigo-200 transition-colors">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Library className="h-5 w-5 text-indigo-600" />
                                    Biblioteca de Prompts
                                </CardTitle>
                                <CardDescription>Organiza y reutiliza tus mejores creaciones.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <p className="text-sm text-slate-600">
                                    1. Accede a la <strong>Biblioteca</strong> para ver tus prompts guardados.
                                </p>
                                <p className="text-sm text-slate-600">
                                    2. Usa los filtros para encontrar prompts por categoría (Marketing, Desarrollo, etc.).
                                </p>
                                <p className="text-sm text-slate-600">
                                    3. Usa el botón <Copy className="h-3 w-3 inline" /> para copiar o <Edit className="h-3 w-3 inline" /> para re-editar.
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* FAQ */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Preguntas Frecuentes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger>¿Qué modelos de IA son compatibles?</AccordionTrigger>
                                    <AccordionContent>
                                        PromptMaster está optimizado para <strong>Gemini 2.5 Flash</strong>, GPT-4o, Claude 3.5 Sonnet y otros modelos LMM modernos. Las instrucciones generadas siguen los estándares de la industria.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-2">
                                    <AccordionTrigger>¿Cómo funcionan las variantes A/B?</AccordionTrigger>
                                    <AccordionContent>
                                        En el modo comparador, la IA recibe dos directivas distintas: una centrada en la eficiencia estructural (A) y otra en la profundidad contextual y creatividad (B). Esto te permite elegir entre un prompt directo o uno más elaborado.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-3">
                                    <AccordionTrigger>¿Se guardan mis prompts de forma segura?</AccordionTrigger>
                                    <AccordionContent>
                                        Sí, todos tus prompts se guardan en tu cuenta privada mediante Firebase Firestore. Solo tú tienes acceso a tu biblioteca de prompts optimizados.
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </CardContent>
                    </Card>

                </div>
            </main>
        </div>
    )
}
