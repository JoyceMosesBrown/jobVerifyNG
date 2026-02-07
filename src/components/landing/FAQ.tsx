import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Is JobVerify NG really free?",
    answer: "Yes! Basic verification is completely free and doesn't require registration. Just paste your job advert and get instant results.",
  },
  {
    question: "How accurate is the verification?",
    answer: "Our system uses pattern recognition and a continuously updated blacklist to detect common scam indicators. While no system is 100% perfect, we catch the majority of known scam patterns.",
  },
  {
    question: "What should I do if a job is marked suspicious?",
    answer: "Exercise extra caution. Verify the company independently, never pay upfront fees, and trust your instincts. If something feels wrong, it probably is.",
  },
  {
    question: "Can I report a scam I've encountered?",
    answer: "Absolutely! If you encounter a confirmed scam, please report it. Your reports help us improve our detection and protect other Nigerians.",
  },
  {
    question: "Do I need to create an account?",
    answer: "No, basic verification is available without an account. However, creating a free account lets you save your verification history and track patterns over time.",
  },
  {
    question: "What types of scam indicators do you check for?",
    answer: "We check for payment requests, urgency language, unrealistic salary promises, suspicious recruiter emails, blacklisted phone numbers and domains, and many other red flags.",
  },
];

export function FAQ() {
  return (
    <section className="py-20 bg-background">
      <div className="container max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Frequently Asked Questions
        </h2>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-card rounded-xl border border-border px-6"
            >
              <AccordionTrigger className="text-left font-medium hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
