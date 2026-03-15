import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ShieldCheck, FileText, Search, CheckCircle2, AlertTriangle, UserPlus, History } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    icon: FileText,
    title: "Paste Job Advert",
    description: "Copy the job advert text from WhatsApp, Telegram, email, or any website and paste it into our verification form. You can also paste a job link/URL if you have one.",
    features: ["Works with text copied from any source", "Supports job links from websites", "No formatting required"],
  },
  {
    number: "02",
    icon: Search,
    title: "Smart Analysis",
    description: "Our intelligent system scans the job advert for red flags using pattern recognition and our continuously updated blacklist database.",
    features: ["Payment request detection", "Urgency language analysis", "Blacklist cross-reference"],
  },
  {
    number: "03",
    icon: CheckCircle2,
    title: "Get Your Verdict",
    description: "Receive a clear verdict with a 0-100 risk score and detailed explanation of what was found. Make informed decisions about whether to proceed.",
    features: ["Clear risk scoring", "Detailed explanations", "Actionable recommendations"],
  },
  {
    number: "04",
    icon: AlertTriangle,
    title: "Report Scams",
    description: "Found a scam? Report it to help protect other Nigerians. Your reports help us improve our detection and keep the community safe.",
    features: ["Easy reporting process", "Community protection", "Continuous improvement"],
  },
];

const accountFeatures = [
  {
    icon: UserPlus,
    title: "Create Account (Optional)",
    description: "Sign up free to save your verification history and track patterns over time.",
  },
  {
    icon: History,
    title: "View History",
    description: "Access all your past verifications from your personal dashboard anytime.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="hero-gradient py-20">
          <div className="container text-center">
            <span className="text-primary font-medium text-sm uppercase tracking-wide">
              Simple & Effective
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-4">
              How JobVerify NG Works
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Verify any job advert in seconds. Our intelligent system helps you avoid scams and find legitimate opportunities.
            </p>
            <Link to="/verify">
              <Button size="lg" className="gap-2">
                <ShieldCheck className="w-5 h-5" />
                Try It Now — It's Free
              </Button>
            </Link>
          </div>
        </section>

        {/* Steps */}
        <section className="py-20">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">4 Simple Steps to Safety</h2>
              <p className="text-muted-foreground">
                No registration required for basic verification. Just paste and verify.
              </p>
            </div>

            <div className="space-y-16">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className={`grid md:grid-cols-2 gap-12 items-center ${
                    index % 2 === 1 ? "md:flex-row-reverse" : ""
                  }`}
                >
                  <div className={index % 2 === 1 ? "md:order-2" : ""}>
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-6xl font-bold text-primary/20">{step.number}</span>
                      <div className="icon-container">
                        <step.icon className="w-6 h-6" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                    <p className="text-muted-foreground mb-6">{step.description}</p>
                    <ul className="space-y-2">
                      {step.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className={`bg-card rounded-2xl p-8 border border-border ${index % 2 === 1 ? "md:order-1" : ""}`}>
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                        <step.icon className="w-8 h-8 text-primary" />
                      </div>
                      <p className="font-medium">Step {step.number}</p>
                      <p className="text-muted-foreground text-sm">{step.title}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Account Features */}
        <section className="py-20 hero-gradient">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Want to Save Your History?</h2>
              <p className="text-muted-foreground">
                Create a free account to unlock additional features.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-8">
              {accountFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-xl p-6 border border-border"
                >
                  <div className="icon-container mb-4">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>

            <div className="text-center">
              <Link to="/signup">
                <Button variant="outline" size="lg">
                  Create Free Account
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Preview */}
        <section className="py-20">
          <div className="container max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              {[
                {
                  q: "Is JobVerify NG really free?",
                  a: "Yes! Basic verification is completely free and doesn't require registration. Just paste your job advert and get instant results.",
                },
                {
                  q: "How accurate is the verification?",
                  a: "Our system uses pattern recognition and a continuously updated blacklist to detect common scam indicators. While no system is 100% perfect, we catch the majority of known scam patterns.",
                },
                {
                  q: "What should I do if a job is marked suspicious?",
                  a: "Exercise extra caution. Verify the company independently, never pay upfront fees, and trust your instincts. If something feels wrong, it probably is.",
                },
                {
                  q: "Can I report a scam I've encountered?",
                  a: "Absolutely! If you encounter a confirmed scam, please report it. Your reports help us improve our detection and protect other Nigerians.",
                },
              ].map((faq, index) => (
                <div key={index} className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-semibold mb-2">{faq.q}</h3>
                  <p className="text-muted-foreground text-sm">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
