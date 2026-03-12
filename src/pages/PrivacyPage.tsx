import { Link } from "react-router-dom";
import { Lock, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const sections = [
  {
    title: "1. Information We Collect",
    content:
      "We collect information you provide directly: your name and email when creating an account, and job advert content (text, links, or PDF files) when you submit verifications. We also collect basic usage data such as browser type and pages visited to improve our service.",
  },
  {
    title: "2. How We Use Your Information",
    content:
      "We use your information to: provide and improve our verification service, analyze job adverts for scam indicators, maintain our blacklist database, send important account notifications, and generate anonymous platform statistics. We never sell your personal information to third parties.",
  },
  {
    title: "3. Data Storage & Security",
    content:
      "Your data is stored securely using industry-standard encryption. Passwords are hashed using bcrypt and are never stored in plain text. We use JWT tokens for session management with automatic expiration. All data transmissions are encrypted via HTTPS.",
  },
  {
    title: "4. Job Advert Data",
    content:
      "When you submit a job advert for verification, the text content is analyzed and stored to improve our detection algorithms. PDF files are processed for text extraction only — we do not store the original PDF files after analysis. Verification results are linked to your account for your history.",
  },
  {
    title: "5. Sharing of Information",
    content:
      "We do not share your personal information with third parties except: when required by law or legal process, to protect our rights or the safety of our users, or with your explicit consent. Aggregate, anonymized statistics may be shared publicly (e.g., total scams detected).",
  },
  {
    title: "6. Your Rights",
    content:
      "You have the right to: access your personal data, request correction of inaccurate data, request deletion of your account and data, export your verification history, and opt out of non-essential communications. Contact us at support@jobverify.ng to exercise these rights.",
  },
  {
    title: "7. Cookies",
    content:
      "We use essential cookies and local storage to maintain your login session (JWT token). We do not use third-party tracking cookies or advertising cookies. Your authentication token is stored in localStorage and is automatically cleared when you log out.",
  },
  {
    title: "8. Data Retention",
    content:
      "Account data is retained as long as your account is active. Verification history is kept to improve our detection systems. If you delete your account, your personal information will be removed within 30 days, though anonymized verification data may be retained.",
  },
  {
    title: "9. Children's Privacy",
    content:
      "JobVerify NG is not intended for use by individuals under the age of 16. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us immediately.",
  },
  {
    title: "10. Changes to This Policy",
    content:
      "We may update this Privacy Policy from time to time. We will notify you of significant changes via email or through the platform. Your continued use of the service after changes constitutes acceptance of the updated policy.",
  },
  {
    title: "11. Contact Us",
    content:
      "If you have any questions or concerns about this Privacy Policy, please contact us at support@jobverify.ng or visit our Contact Support page.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Back Navigation */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Return to Home
          </Link>
        </div>
      </div>
      <main className="flex-1">
        {/* Hero */}
        <section className="hero-gradient py-20 relative overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="container relative z-10 text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium text-sm mb-6">
                <Lock className="w-4 h-4" />
                Your Privacy Matters
              </span>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Privacy <span className="text-primary">Policy</span>
              </h1>
              <p className="text-muted-foreground">
                Last updated: March 2026
              </p>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="py-16">
          <div className="container max-w-3xl space-y-8">
            {sections.map((section, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <h2 className="text-xl font-bold mb-3">{section.title}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {section.content}
                </p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
