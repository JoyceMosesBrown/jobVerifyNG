import { motion } from "framer-motion";

const stats = [
  { value: "50,000+", label: "Jobs Verified" },
  { value: "10,000+", label: "Scams Detected" },
  { value: "25,000+", label: "Users Protected" },
  { value: "₦500M+", label: "Potentially Saved" },
];

export function Stats() {
  return (
    <section className="py-16 bg-card border-y border-border">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="stat-card"
            >
              <p className="stat-number">{stat.value}</p>
              <p className="stat-label">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
