import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { VerifyForm } from "@/components/verify/VerifyForm";
import { motion } from "framer-motion";

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 hero-gradient py-12">
        <div className="container max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <span className="text-primary font-medium text-sm uppercase tracking-wide">
              Free Verification
            </span>
            <h1 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
              Verify a Job Advert
            </h1>
            <p className="text-muted-foreground">
              Paste the job advert text or link below. We'll analyze it for red flags instantly.
            </p>
          </motion.div>

          <VerifyForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}
