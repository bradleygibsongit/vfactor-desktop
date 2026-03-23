import { Hammer, Wrench, Home, Shield, ArrowUpRight } from "lucide-react"
import { motion } from "framer-motion"

const services = [
  {
    icon: Home,
    title: "Residential Roofing",
    description: "Complete roof installation and replacement for homes of all sizes. From traditional shingles to modern metal systems.",
    features: ["Asphalt Shingles", "Metal Roofing", "Tile & Slate", "Flat Roofs"],
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
  },
  {
    icon: Shield,
    title: "Roof Repairs",
    description: "Expert repair services for leaks, storm damage, and wear. Quick response times and lasting solutions.",
    features: ["Leak Detection", "Storm Damage", "Emergency Repairs", "Maintenance"],
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80",
  },
  {
    icon: Wrench,
    title: "Commercial Roofing",
    description: "Large-scale roofing solutions for businesses, warehouses, and industrial facilities with minimal disruption.",
    features: ["TPO & EPDM", "Built-Up Roofing", "Modified Bitumen", "Coating Systems"],
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80",
  },
  {
    icon: Hammer,
    title: "Historic Restoration",
    description: "Specialized restoration for historic properties. Preserving architectural integrity with modern protection.",
    features: ["Slate Restoration", "Copper Work", "Custom Fabrication", "Period Accuracy"],
    image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=600&q=80",
  },
]

export function Services() {
  return (
    <section id="services" className="py-24 bg-stone-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-amber-600 font-semibold text-sm tracking-widest uppercase mb-4 block">
            What We Do
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-slate-950 mb-6">
            Expert Roofing Services
          </h2>
          <p className="text-slate-600 text-lg">
            From minor repairs to complete installations, we deliver craftsmanship 
            that stands the test of time.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="flex flex-col lg:flex-row">
                {/* Image */}
                <div className="lg:w-2/5 relative overflow-hidden">
                  <div 
                    className="h-48 lg:h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url('${service.image}')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent lg:bg-gradient-to-r" />
                </div>

                {/* Content */}
                <div className="lg:w-3/5 p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center">
                      <service.icon className="w-7 h-7 text-amber-600" />
                    </div>
                    <a 
                      href="#contact" 
                      className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-amber-500 transition-colors"
                    >
                      <ArrowUpRight className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors" />
                    </a>
                  </div>

                  <h3 className="font-serif text-2xl font-bold text-slate-950 mb-3">
                    {service.title}
                  </h3>
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    {service.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {service.features.map((feature) => (
                      <span 
                        key={feature}
                        className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
