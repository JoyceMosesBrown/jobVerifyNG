import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ShieldCheck, Users, Target, Heart, CheckCircle, Shield, Zap } from "lucide-react";
import { motion } from "framer-motion";

const values = [
  {
    icon: ShieldCheck,
    title: "Protection First",
    description: "We prioritize user safety above all else. Every feature we build is designed to protect job seekers.",
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "Our detection improves through community reports. Together, we're building a safer job market.",
  },
  {
    icon: Target,
    title: "Accuracy",
    description: "We continuously refine our algorithms to minimize false positives while catching real scams.",
  },
  {
    icon: Heart,
    title: "Accessibility",
    description: "Basic verification is free and requires no registration. Everyone deserves protection.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="hero-gradient py-20 relative overflow-hidden">
          {/* Background orbs */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          
          <div className="container relative z-10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium text-sm mb-6">
                  <Shield className="w-4 h-4" />
                  Our Mission
                </span>
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  Protecting Nigerians from{" "}
                  <span className="text-primary">Job Scams</span>
                </h1>
                <p className="text-lg text-muted-foreground">
                  We're on a mission to eliminate job scams in Nigeria. Every day, we help thousands of job seekers verify opportunities and avoid fraud.
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                <div className="glass-card rounded-3xl p-8 shadow-2xl">
                  <div className="flex flex-col items-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                      className="w-28 h-28 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-6 shadow-lg shadow-primary/30"
                    >
                      <ShieldCheck className="w-14 h-14 text-primary-foreground" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-center mb-4">JobVerify NG</h3>
                    <p className="text-muted-foreground text-center text-sm mb-6">
                      Nigeria's #1 Job Verification Platform
                    </p>
                    <div className="space-y-3 w-full">
                      <div className="flex items-center gap-3 text-sm">
                        <CheckCircle className="w-5 h-5 text-primary" />
                        <span>Free to use</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <CheckCircle className="w-5 h-5 text-primary" />
                        <span>No registration required</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <CheckCircle className="w-5 h-5 text-primary" />
                        <span>Instant results</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <CheckCircle className="w-5 h-5 text-primary" />
                        <span>Community-driven protection</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20">
          <div className="container max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why We Built JobVerify NG</h2>
              <div className="w-20 h-1 bg-primary mx-auto rounded-full" />
            </motion.div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-4 text-muted-foreground"
              >
                <p>
                  Every year, millions of Nigerians fall victim to job scams, losing billions of naira to fraudsters who exploit their hope for employment.
                </p>
                <p>
                  We've seen friends, family members, and colleagues lose money to fake job offers that promised high salaries, work-from-home opportunities, or quick employment.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-4 text-muted-foreground"
              >
                <p>
                  JobVerify NG was created to give power back to job seekers. By providing instant, free verification of job adverts, we help people make informed decisions.
                </p>
                <p>
                  Our mission is simple: protect job seekers from sharing personal information or paying fees to fraudsters before it's too late.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 hero-gradient">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Values</h2>
              <div className="w-20 h-1 bg-primary mx-auto rounded-full" />
            </motion.div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card rounded-2xl p-6 text-center group hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                    <value.icon className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <h3 className="font-semibold mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How We Help */}
        <section className="py-20">
          <div className="container max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How We Protect You</h2>
              <div className="w-20 h-1 bg-primary mx-auto rounded-full" />
            </motion.div>
            
            <div className="space-y-6">
              {[
                {
                  icon: Zap,
                  title: "Pattern Recognition",
                  description: "Our system analyzes job adverts for common scam patterns: payment requests, urgency language, unrealistic salary promises, and suspicious contact information."
                },
                {
                  icon: Shield,
                  title: "Blacklist Database",
                  description: "We maintain a constantly updated database of known scam emails, phone numbers, and domains. When you verify a job, we check against this database instantly."
                },
                {
                  icon: Users,
                  title: "Community Reports",
                  description: "When users report scams, we review them and update our detection systems. This community-driven approach helps us catch new scam patterns faster."
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card rounded-2xl p-6 flex gap-4 items-start hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
