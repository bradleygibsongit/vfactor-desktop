import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { motion } from "framer-motion"
import { HelpCircle } from "lucide-react"

const faqs = [
  {
    question: "How long does a typical roof replacement take?",
    answer: "Most residential roof replacements are completed in 2-5 days, depending on the size and complexity of your roof. Weather conditions and material availability can also affect timing. We'll provide a detailed timeline during your estimate.",
  },
  {
    question: "Do you offer financing options?",
    answer: "Yes, we partner with several financing providers to offer flexible payment plans. We have options for various credit profiles, including 0% interest plans for qualified buyers. Our team can walk you through all available options during your consultation.",
  },
  {
    question: "What roofing materials do you recommend?",
    answer: "The best material depends on your home's architecture, local climate, and budget. We specialize in asphalt shingles, metal roofing, slate, tile, and flat roof systems. During our inspection, we'll recommend the optimal solution for your specific needs.",
  },
  {
    question: "Do you handle insurance claims for storm damage?",
    answer: "Absolutely. We have extensive experience working with insurance companies on storm damage claims. Our team will document all damage, provide detailed reports, and work directly with your adjuster to ensure you receive fair coverage for necessary repairs.",
  },
  {
    question: "What warranties do you provide?",
    answer: "We offer comprehensive warranties including manufacturer warranties (up to 50 years on materials) and our own workmanship warranty (10-25 years depending on the project). We also provide ongoing maintenance support to keep your warranty valid.",
  },
  {
    question: "Can you repair my roof instead of replacing it?",
    answer: "In many cases, yes. If your roof is less than 20 years old and the damage is localized, repairs can extend its life significantly. We always start with an honest assessment and will recommend repair if it's the most cost-effective solution for you.",
  },
]

export function FAQ() {
  return (
    <section id="faq" className="py-24 bg-stone-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:sticky lg:top-32"
          >
            <span className="text-amber-600 font-semibold text-sm tracking-widest uppercase mb-4 block">
              Common Questions
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-slate-950 mb-6">
              Frequently Asked
            </h2>
            <p className="text-slate-600 text-lg mb-8">
              Got questions? We've got answers. If you don't find what you're looking 
              for, reach out to our team for personalized assistance.
            </p>

            <div className="flex items-center gap-4 p-6 bg-amber-50 rounded-2xl">
              <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                <HelpCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-slate-950">Still have questions?</p>
                <a href="#contact" className="text-amber-600 hover:text-amber-700 font-medium">
                  Contact our team →
                </a>
              </div>
            </div>
          </motion.div>

          {/* Right FAQ Accordion */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="border-b border-slate-200"
                >
                  <AccordionTrigger className="text-left font-semibold text-slate-950 hover:text-amber-600 py-6 text-lg">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 leading-relaxed pb-6">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
