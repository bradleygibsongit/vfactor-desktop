import { BadgeCheck, HardHat, Leaf, Clock, FileCheck, HeartHandshake } from "lucide-react"
import { motion } from "framer-motion"

const features = [
  {
    icon: BadgeCheck,
    title: "Licensed & Insured",
    description: "Fully certified with comprehensive insurance coverage for your peace of mind.",
  },
  {
    icon: HardHat,
    title: "Master Craftsmen",
    description: "Our team averages 15+ years experience. No subcontractors, only trained professionals.",
  },
  {
    icon: Leaf,
    title: "Eco-Friendly Options",
    description: "Sustainable materials and energy-efficient solutions that reduce your footprint.",
  },
  {
    icon: Clock,
    title: "On-Time Guarantee",
    description: "We stick to our timelines. Most residential projects completed in 2-5 days.",
  },
  {
    icon: FileCheck,
    title: "Transparent Pricing",
    description: "No hidden fees. Detailed estimates with itemized costs before any work begins.",
  },
  {
    icon: HeartHandshake,
    title: "Lifetime Support",
    description: "Our relationship doesn't end at installation. We're here for the life of your roof.",
  },
]

export function WhyUs() {
  return (
    <section className="py-24 bg-slate-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Gradient Overlays */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-amber-400 font-semibold text-sm tracking-widest uppercase mb-4 block">
              Why Choose Us
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
              Built on Trust,
              <span className="block text-amber-400">Crafted with Care</span>
            </h2>
            <p className="text-slate-300 text-lg mb-8 leading-relaxed">
              For over two decades, we've been more than just roofers—we're protectors 
              of homes, guardians of memories, and craftsmen dedicated to excellence in 
              every shingle we place.
            </p>

            {/* Trust Stats */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <p className="text-3xl font-bold text-amber-400">100%</p>
                <p className="text-slate-400 text-sm">Satisfaction</p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <p className="text-3xl font-bold text-amber-400">0</p>
                <p className="text-slate-400 text-sm">Complaints</p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <p className="text-3xl font-bold text-amber-400">50yr</p>
                <p className="text-slate-400 text-sm">Materials</p>
              </div>
            </div>

            <a 
              href="#contact"
              className="inline-flex items-center gap-2 text-amber-400 font-semibold hover:text-amber-300 transition-colors"
            >
              Schedule Your Free Inspection
              <span className="text-xl">→</span>
            </a>
          </motion.div>

          {/* Right Features Grid */}
          <div className="grid sm:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-amber-500/30 transition-colors">
                  <feature.icon className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="font-serif text-xl font-bold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
