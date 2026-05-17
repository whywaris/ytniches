import type { Metadata } from 'next'
import Link from 'next/link'
import { Mail, Lightbulb, Briefcase } from 'lucide-react'
import { ContactForm } from '@/components/legal/ContactForm'

export const metadata: Metadata = {
  title: 'Contact YTNiches — We\'re Here to Help',
  description: 'Have a question about YTNiches? Contact our support team. We reply within 24 hours.',
  alternates: { canonical: 'https://ytniches.com/contact' },
}

const CONTACT_OPTIONS = [
  {
    icon: Mail,
    title: 'Email Support',
    text: 'For account, billing, or general questions',
    email: 'support@ytniches.com',
    cta: 'Send Email',
  },
  {
    icon: Lightbulb,
    title: 'Suggest a Feature',
    text: 'Have an idea? We read every suggestion',
    email: 'feedback@ytniches.com',
    cta: 'Send Feedback',
  },
  {
    icon: Briefcase,
    title: 'Business & Partnerships',
    text: 'For partnerships, press, or business deals',
    email: 'business@ytniches.com',
    cta: 'Get in Touch',
  },
]

const FAQS = [
  { q: 'How do I cancel my subscription?', a: 'Go to Dashboard → Settings → Plan & Billing → Cancel. No questions asked.' },
  { q: 'Do you offer refunds?', a: 'Yes — 7-day money back guarantee on Pro and Lifetime plans. Email support@ytniches.com with your order details.' },
  { q: 'How often are new niches added?', a: 'We add 30+ new niches every month. Pro members get access immediately.' },
  { q: 'Is there a free plan?', a: 'Yes — 5 niches free forever. No credit card required.' },
]

export default function ContactPage() {
  return (
    <div className="py-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-xs text-[#8A7F72] mb-8">
          <Link href="/" className="hover:text-[#1A1612]">Home</Link>
          <span className="mx-2">→</span>
          <span className="text-[#1A1612]">Contact</span>
        </nav>

        {/* Hero */}
        <div className="mb-12">
          <h1 className="font-display font-black text-[36px] sm:text-[44px] text-[#1A1612] leading-tight mb-3">
            Contact Us
          </h1>
          <p className="text-lg text-[#6B6259]">We reply to every message within 24 hours.</p>
        </div>

        {/* Contact Options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
          {CONTACT_OPTIONS.map(({ icon: Icon, title, text, email, cta }) => (
            <div key={title} className="bg-white rounded-[20px] border border-[#E0D9CE] p-5 text-center">
              <div className="w-10 h-10 rounded-xl bg-[#FDF0ED] flex items-center justify-center mx-auto mb-3">
                <Icon className="w-5 h-5 text-[#E8402A]" />
              </div>
              <h3 className="font-bold text-sm text-[#1A1612] mb-1">{title}</h3>
              <p className="text-xs text-[#8A7F72] mb-3">{text}</p>
              <a
                href={`mailto:${email}`}
                className="inline-block text-xs font-bold text-[#E8402A] hover:text-[#CF3520] transition-colors"
              >
                {cta} →
              </a>
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <section className="mb-16">
          <h2 className="font-display font-bold text-2xl text-[#1A1612] mb-6">Send Us a Message</h2>
          <ContactForm />
        </section>

        {/* FAQ */}
        <section>
          <h2 className="font-display font-bold text-2xl text-[#1A1612] mb-6">Quick Answers</h2>
          <div className="space-y-4">
            {FAQS.map(({ q, a }) => (
              <div key={q} className="bg-white rounded-[16px] border border-[#E0D9CE] p-5">
                <h3 className="font-semibold text-sm text-[#1A1612] mb-1.5">{q}</h3>
                <p className="text-sm text-[#8A7F72] leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
