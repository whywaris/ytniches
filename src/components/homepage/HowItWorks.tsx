import { Compass, Package, Play } from 'lucide-react'

const STEPS = [
  {
    step: '01',
    title: 'Pick a Niche',
    body: 'Browse niches filtered by RPM, competition level, and category. Find your perfect fit in minutes, not months.',
    icon: Compass,
  },
  {
    step: '02',
    title: 'Get Your Complete Kit',
    body: 'Unlock 30 video ideas, script hooks, title templates, thumbnail prompts, and a 30-day content calendar — instantly.',
    icon: Package,
  },
  {
    step: '03',
    title: 'Start Creating',
    body: 'Follow your content calendar and post with confidence from day one. No more staring at a blank page.',
    icon: Play,
  },
]

export function HowItWorks() {
  return (
    <section className="py-20 px-4 bg-[#EDE8DF]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-[#8A7F72] mb-3">
            How it works
          </p>
          <h2 className="font-display font-bold text-[32px] sm:text-[38px] text-[#1A1612]">
            Three Steps to Your Faceless Channel
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map(({ step, title, body, icon: Icon }) => (
            <div
              key={step}
              className="bg-white rounded-[20px] border border-[#E0D9CE] p-8 shadow-[0_2px_12px_0_rgba(26,22,18,0.06)]"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#FDF0ED] flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#E8402A]" />
                </div>
                <span className="font-display font-black text-[32px] text-[#E8402A]/20 leading-none">
                  {step}
                </span>
              </div>
              <h3 className="font-display font-bold text-[18px] text-[#1A1612] mb-2">
                {title}
              </h3>
              <p className="text-sm text-[#8A7F72] leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
