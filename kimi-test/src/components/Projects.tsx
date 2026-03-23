import { motion } from "framer-motion"
import { MapPin, ArrowUpRight } from "lucide-react"

const projects = [
  {
    title: "Victorian Restoration",
    location: "Historic District",
    type: "Residential",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    tags: ["Slate", "Copper"],
  },
  {
    title: "Modern Estate",
    location: "Westside Hills",
    type: "Residential",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
    tags: ["Metal", "Contemporary"],
  },
  {
    title: "Commercial Complex",
    location: "Business Park",
    type: "Commercial",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
    tags: ["TPO", "Flat Roof"],
  },
  {
    title: "Craftsman Revival",
    location: "Oakwood Neighborhood",
    type: "Residential",
    image: "https://images.unsplash.com/photo-1600585154526-3d9c9a9d9c9c?w=800&q=80",
    tags: ["Asphalt", "Custom"],
  },
  {
    title: "Mountain Retreat",
    location: "Aspen Ridge",
    type: "Residential",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
    tags: ["Metal", "Weatherproof"],
  },
  {
    title: "Industrial Warehouse",
    location: "Port District",
    type: "Commercial",
    image: "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=800&q=80",
    tags: ["EPDM", "Large Scale"],
  },
]

export function Projects() {
  return (
    <section id="projects" className="py-24 bg-stone-50">
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
            Our Portfolio
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-slate-950 mb-6">
            Recently Completed
          </h2>
          <p className="text-slate-600 text-lg">
            Browse our gallery of completed roofing projects. Each one represents 
            our commitment to quality and craftsmanship.
          </p>
        </motion.div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all duration-500"
            >
              {/* Image Container */}
              <div className="aspect-[4/3] overflow-hidden">
                <div 
                  className="h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url('${project.image}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
              </div>

              {/* Content Overlay */}
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  {/* Type Badge */}
                  <span className="inline-block px-3 py-1 bg-amber-500 text-slate-950 text-xs font-semibold rounded-full mb-3">
                    {project.type}
                  </span>

                  <h3 className="font-serif text-2xl font-bold text-white mb-2">
                    {project.title}
                  </h3>

                  <div className="flex items-center gap-1 text-slate-300 text-sm mb-4">
                    <MapPin className="w-4 h-4" />
                    {project.location}
                  </div>

                  {/* Tags */}
                  <div className="flex gap-2 mb-4">
                    {project.tags.map((tag) => (
                      <span 
                        key={tag}
                        className="px-2 py-1 bg-white/20 text-white text-xs rounded backdrop-blur-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* View Project Link */}
                  <a 
                    href="#contact"
                    className="inline-flex items-center gap-2 text-amber-400 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    Get Similar Quote
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <a 
            href="#contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-slate-950 text-white font-semibold rounded-full hover:bg-slate-800 transition-colors"
          >
            Start Your Project
            <ArrowUpRight className="w-5 h-5" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
