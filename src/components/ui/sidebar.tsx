import { cn } from "@/lib/utils"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
}

export function Sidebar({ className, children }: SidebarProps) {
    return (
        <div className={cn("pb-12 min-h-screen border-r bg-gray-50/40 hidden md:block w-64", className)}>
            <div className="space-y-4 py-4">
                {children}
            </div>
        </div>
    )
}
