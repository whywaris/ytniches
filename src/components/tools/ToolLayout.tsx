interface ToolLayoutProps {
  title: string
  description: string
  icon?: React.ReactNode
  children: React.ReactNode
  relatedTools?: { name: string; href: string; description: string }[]
}

export function ToolLayout({ title, description, children }: ToolLayoutProps) {
  return (
    <div className="py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="font-display font-black text-[36px] sm:text-[44px] leading-tight text-foreground mb-4">
            {title}
          </h1>
          <p className="text-muted text-lg max-w-xl mx-auto">
            {description}
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
