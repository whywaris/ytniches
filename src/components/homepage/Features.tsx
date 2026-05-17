import { Database, DollarSign, Calendar, Sparkles, Image, Wrench } from 'lucide-react'

const FEATURES = [
  {
    title: 'Researched Niches',
    body: 'Not random ideas — every niche manually vetted for RPM potential and competition level.',
    icon: Database,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    title: 'Real RPM Data',
    body: 'Know your earning potential before you start. Finance niches earn $12-20 RPM. We show you exactly.',
    icon: DollarSign,
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    title: '30-Day Content Calendar',
    body: 'Never wonder what to post next. Get 30 ready-made video ideas for your chosen niche.',
    icon: Calendar,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  {
    title: 'Script Hooks & Ideas',
    body: 'Start every video strong with proven hook templates that get viewers to stay.',
    icon: Sparkles,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    title: 'Thumbnail Prompts',
    body: 'AI-ready thumbnail prompts for every niche. Generate stunning thumbnails without design skills.',
    icon: Image,
    color: 'text-pink-600',
    bg: 'bg-pink-50',
  },
  {
    title: 'Free YouTube Tools',
    body: 'Thumbnail downloader, revenue calculator, tag extractor and more — completely free.',
    icon: Wrench,
    color: 'text-teal-600',
    bg: 'bg-teal-50',
  },
]

export function Features() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-[#8A7F72] mb-3">
            Features
          </p>
          <h2 className="font-display font-bold text-[32px] sm:text-[38px] text-[#1A1612]">
            Everything a Faceless Creator Needs
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ title, body, icon: Icon, color, bg }) => (
            <div
              key={title}
              className="bg-white rounded-[20px] border border-[#E0D9CE] p-6 hover:shadow-[0_8px_32px_0_rgba(26,22,18,0.08)] transition-shadow"
            >
              <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <h3 className="font-display font-bold text-[16px] text-[#1A1612] mb-2">{title}</h3>
              <p className="text-sm text-[#8A7F72] leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
