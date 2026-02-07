import { FileText, Search, CheckCircle2, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    icon: FileText,
    title: "Paste Job Advert",
    description: "Copy the job advert text from WhatsApp, Telegram, email, or any website and paste it into our verification form.",
  },
  {
    number: "02",
    icon: Search,
    title: "Instant Analysis",
    description: "Our system scans for red flags: payment requests, urgency language, unrealistic salaries, and blacklisted contacts.",
  },
  {
    number: "03",
    icon: CheckCircle2,
    title: "Get Results",
    description: "Receive a clear verdict with risk score and detailed explanation of what was found (or not found).",
  },
  {
    number: "04",
    icon: AlertTriangle,
    title: "Report Scams",
    description: "Found a scam? Report it to help protect other Nigerians. Your reports help us improve our detection.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 hero-gradient">
      <div className="container">
        <div className="text-center mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wide">Workflow</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Verify any job advert in 4 simple steps. No registration required for basic verification.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="feature-card relative overflow-hidden"
            >
              <span className="step-number">{step.number}</span>
              <div className="icon-container mb-4 relative z-10">
                <step.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2 relative z-10">{step.title}</h3>
              <p className="text-muted-foreground text-sm relative z-10">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
