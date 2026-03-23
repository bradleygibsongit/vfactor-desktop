import { Facebook, Instagram, Twitter, Linkedin, ArrowUpRight } from "lucide-react"

const footerLinks = {
  services: [
    { label: "Residential Roofing", href: "#services" },
    { label: "Commercial Roofing", href: "#services" },
    { label: "Roof Repairs", href: "#services" },
    { label: "Emergency Service", href: "#contact" },
    { label: "Historic Restoration", href: "#services" },
  ],
  company: [
    { label: "About Us", href: "#" },
    { label: "Our Projects", href: "#projects" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#contact" },
  ],
  resources: [
    { label: "Roofing Guide", href: "#" },
    { label: "FAQ", href: "#faq" },
    { label: "Financing", href: "#" },
    { label: "Warranty Info", href: "#" },
    { label: "Blog", href: "#" },
  ],
}

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
]

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300">
      {/* CTA Section */}
      <div className="border-b border-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready for a stronger roof?
              </h2>
              <p className="text-slate-400 text-lg">
                Get your free estimate today. No pressure, just honest advice.
              </p>
            </div>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-amber-500 text-slate-950 font-semibold rounded-full hover:bg-amber-600 transition-colors"
            >
              Get Free Estimate
              <ArrowUpRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <a href="#" className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-6 h-6 text-white"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 21h18M4 21V8l8-4 8 4v13M9 21v-9h6v9" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-lg text-white leading-tight">
                  Shield & Craft
                </span>
                <span className="text-xs tracking-widest uppercase text-slate-500">
                  Roofing Experts
                </span>
              </div>
            </a>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Protecting homes and businesses with premium roofing solutions since 1998.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-amber-500 hover:text-slate-950 transition-all"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-white mb-6">Services</h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-slate-400 hover:text-amber-400 transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-white mb-6">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-slate-400 hover:text-amber-400 transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-white mb-6">Resources</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-slate-400 hover:text-amber-400 transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">
              © 2024 Shield & Craft Roofing. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-slate-500 hover:text-slate-300 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-slate-500 hover:text-slate-300 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-slate-500 hover:text-slate-300 transition-colors">
                License Info
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
