import { Star, Quote } from "lucide-react"
import { motion } from "framer-motion"

const testimonials = [
  {
    name: "Sarah & Mike Thompson",
    role: "Homeowners",
    location: "Westside Hills",
    quote: "Shield & Craft transformed our 1920s craftsman home with such care and precision. They matched every historical detail while upgrading our protection. The crew was professional, clean, and finished ahead of schedule.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200&q=80",
  },
  {
    name: "David Chen",
    role: "Property Manager",
    location: "Downtown Properties LLC",
    quote: "We've used them for three commercial buildings over five years. Their attention to detail and transparent communication makes them our go-to roofing partner. Zero callbacks on any project.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1600585154526-3d9c9a9d9c9c?w=200&q=80",
  },
  {
    name: "Eleanor Whitmore",
    role: "Historic Home Owner",
    location: "Heritage District",
    quote: "After the storm damage, I was worried about finding someone who understood slate roofing. They restored our 1890s Victorian with period-accurate materials. It's more beautiful than when it was built.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200&q=80",
  },
]

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-white">
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
            Client Stories
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-slate-950 mb-6">
            What Our Clients Say
          </h2>
          <p className="text-slate-600 text-lg">
            Don't just take our word for it. Here's what homeowners and businesses 
            say about their experience with Shield & Craft.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative bg-stone-50 rounded-2xl p-8"
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6">
                <Quote className="w-10 h-10 text-amber-200" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-slate-700 mb-8 leading-relaxed relative z-10">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div 
                  className="w-14 h-14 rounded-full bg-cover bg-center"
                  style={{ backgroundImage: `url('${testimonial.image}')` }}
                />
                <div>
                  <p className="font-semibold text-slate-950">{testimonial.name}</p>
                  <p className="text-slate-500 text-sm">{testimonial.role}</p>
                  <p className="text-amber-600 text-sm">{testimonial.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20 pt-12 border-t border-slate-200"
        >
          <p className="text-center text-slate-500 text-sm mb-8">
            Trusted by homeowners and businesses across the region
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center font-bold text-slate-600">
                BBB
              </div>
              <span className="text-slate-600 font-semibold">A+ Rated</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-slate-600" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span className="text-slate-600 font-semibold">Certified</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-slate-600" fill="currentColor">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <span className="text-slate-600 font-semibold">Insured</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center font-bold text-slate-600">
                5★
              </div>
              <span className="text-slate-600 font-semibold">500+ Reviews</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
