import { Zap, ShieldCheck, Database, AlertCircle, FileText, Users } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Zap,
    title: "Instant Verification",
    description: "Paste any job advert and get immediate results. Our AI-powered system analyzes text in seconds.",
  },
  {
    icon: ShieldCheck,
    title: "Scam Detection",
    description: "We detect payment requests, urgency tactics, unrealistic salaries, and other red flags.",
  },
  {
    icon: Database,
    title: "Blacklist Database",
    description: "We maintain a database of known scam emails, phone numbers, and domains to protect you.",
  },
  {
    icon: AlertCircle,
    title: "Risk Scoring",
    description: "Get a clear 0-100 risk score with detailed explanations of what raised flags.",
  },
  {
    icon: FileText,
    title: "Save History",
    description: "Create a free account to save your verification results and track patterns over time.",
  },
  {
    icon: Users,
    title: "Community Reports",
    description: "Our community helps identify new scams. Report suspicious adverts to protect others.",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function Features() {
  return (
    <section className="py-20 bg-background">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">We help you verify jobs safely.</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Stop wasting time on fake job adverts. Our platform uses smart detection to separate real opportunities from scams.
          </p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={item} className="feature-card">
              <div className="icon-container mb-4">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
