import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldCheck, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="hero-gradient py-16 md:py-24">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border mb-6">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                Nigeria&apos;s #1 Job Verification Platform
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Verify Job Adverts.
              <br />
              <span className="text-primary">Avoid Scams.</span>
              <br />
              Stay Safe.
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-lg">
              We don&apos;t post jobs. We help Nigerians verify job adverts before
              applying so you never fall for a scam.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link to="/verify" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto gap-2">
                  <ShieldCheck className="w-5 h-5" />
                  Verify a Job Advert
                </Button>
              </Link>

              <Link to="/how-it-works" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  How It Works
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>100% Free</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>No Registration Required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Instant Results</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="glass-card rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              <div className="relative z-10 flex flex-col items-center py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                  className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-6"
                >
                  <ShieldCheck className="w-16 h-16 text-primary-foreground" />
                </motion.div>

                <h3 className="text-xl font-bold text-center mb-2">
                  Verify Before You Apply
                </h3>
                <p className="text-muted-foreground text-center text-sm max-w-xs">
                  Paste any job advert and get an instant risk assessment powered
                  by our intelligent detection system.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
