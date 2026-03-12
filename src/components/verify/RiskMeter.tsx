import { motion } from "framer-motion";

interface RiskMeterProps {
  score: number;
}

export function RiskMeter({ score }: RiskMeterProps) {
  const getColor = (score: number) => {
    if (score <= 4) return "bg-green-500";
    if (score <= 8) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getLabel = (score: number) => {
    if (score <= 4) return "Low Risk";
    if (score <= 8) return "Moderate Risk";
    return "High Risk";
  };

  // Map score to bar width: 10 = full bar, cap at 100%
  const barWidth = Math.min((score / 10) * 100, 100);

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Risk Score</span>
        <span className="text-sm text-muted-foreground">{getLabel(score)}</span>
      </div>
      <div className="risk-meter bg-muted h-6 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${barWidth}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`risk-meter-fill h-full ${getColor(score)} rounded-full flex items-center justify-end pr-2`}
        >
          <span className="text-xs font-bold text-white">{score}</span>
        </motion.div>
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0 - Safe</span>
        <span>10+ - High Risk</span>
      </div>
    </div>
  );
}
