import { Link } from "react-router-dom";
import { FileText, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const sections = [
  {
    title: "1. Acceptance of Terms",
    content:
      "By accessing and using JobVerify NG, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.",
  },
  {
    title: "2. Description of Service",
    content:
      "JobVerify NG provides a free job advert verification service that analyzes job postings for potential scam indicators. Our service uses automated analysis and community reports to assess job adverts. The results are advisory and should not be considered as definitive proof of legitimacy or fraud.",
  },
  {
    title: "3. User Accounts",
    content:
      "To access certain features, you may need to create an account. You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You agree to provide accurate and complete information when creating your account.",
  },
  {
    title: "4. Acceptable Use",
    content:
      "You agree not to misuse our service. This includes: submitting false reports, attempting to manipulate verification results, using the platform for any unlawful purpose, attempting to gain unauthorized access to our systems, or using automated tools to scrape or overload our service.",
  },
  {
    title: "5. Verification Results",
    content:
      "Our verification results are based on automated pattern analysis and should be used as one factor in your decision-making process. JobVerify NG does not guarantee the accuracy of verification results and is not liable for decisions made based on our analysis. A low-risk score does not guarantee a job is legitimate, and a high-risk score does not definitively mean a job is a scam.",
  },
  {
    title: "6. User Content & Reports",
    content:
      "When you submit job adverts for verification or file reports, you grant us the right to analyze, store, and use this content to improve our service. You should not submit content that you do not have the right to share. Reports submitted in bad faith may result in account suspension.",
  },
  {
    title: "7. Privacy",
    content:
      "Your use of our service is also governed by our Privacy Policy. By using JobVerify NG, you consent to the collection and use of your information as described in the Privacy Policy.",
  },
  {
    title: "8. Limitation of Liability",
    content:
      "JobVerify NG is provided \"as is\" without warranties of any kind. We shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service. Our total liability shall not exceed the amount you paid for using our service (which is currently free).",
  },
  {
    title: "9. Changes to Terms",
    content:
      "We reserve the right to modify these terms at any time. We will notify users of significant changes through the platform. Continued use of the service after changes constitutes acceptance of the modified terms.",
  },
  {
    title: "10. Contact",
    content:
      "If you have any questions about these Terms of Service, please contact us at support@jobverify.ng.",
  },
];

export default function TermsPage() {
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
                <FileText className="w-4 h-4" />
                Legal
              </span>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Terms of <span className="text-primary">Service</span>
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
