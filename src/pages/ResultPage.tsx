import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiGetVerification, apiSaveVerification } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Search,
  ChevronRight,
  ChevronDown,
  Flag,
  Save,
  ArrowLeft,
  Loader2,
  Info,
  AlertOctagon,
  Skull,
} from "lucide-react";
import { RiskMeter } from "@/components/verify/RiskMeter";
import { ReportDialog } from "@/components/verify/ReportDialog";

type Verdict =
  | "verified"
  | "likely_legit"
  | "needs_review"
  | "suspicious"
  | "high_risk_scam";

interface VerificationResult {
  id: string;
  advert_text: string | null;
  advert_link: string | null;
  source_platform: string | null;
  recruiter_email: string | null;
  recruiter_phone: string | null;
  risk_score: number;
  verdict: Verdict;
  indicators: (string | { title: string; matches?: string[]; explanation?: string })[];
  user_id: string | null;
  saved: boolean;
  created_at: string;
}

function ExpandableIndicator({ index, title, matches, explanation }: {
  index: number;
  title: string;
  matches: string[];
  explanation: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasDetails = explanation || (matches && matches.length > 0);

  return (
    <motion.li
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + index * 0.1 }}
      className="rounded-lg overflow-hidden"
    >
      <button
        onClick={() => hasDetails && setExpanded(!expanded)}
        className={`w-full flex items-start gap-3 p-3 bg-muted/50 text-left ${hasDetails ? "cursor-pointer hover:bg-muted/80 transition-colors" : ""}`}
      >
        {hasDetails ? (
          expanded ? (
            <ChevronDown className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          ) : (
            <ChevronRight className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          )
        ) : (
          <ChevronRight className="w-5 h-5 text-warning shrink-0 mt-0.5" />
        )}
        <span className="text-sm">{title}</span>
      </button>
      {expanded && hasDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="px-4 pb-3 pt-1 bg-muted/30 border-t border-border/50"
        >
          {matches && matches.length > 0 && (
            <div className="mb-2">
              <p className="text-xs font-medium text-muted-foreground mb-1">Detected phrases:</p>
              <div className="flex flex-wrap gap-1.5">
                {matches.map((match, i) => (
                  <span key={i} className="inline-block px-2 py-0.5 bg-orange-100 text-orange-800 text-xs rounded-full">
                    "{match}"
                  </span>
                ))}
              </div>
            </div>
          )}
          {explanation && (
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>Why this matters:</strong> {explanation}
            </p>
          )}
        </motion.div>
      )}
    </motion.li>
  );
}

const verdictConfig = {
  verified: {
    icon: ShieldCheck,
    label: "Legit",
    color: "bg-green-100 text-green-800 border-green-200",
    description: "No risk indicators detected. This appears to be a legitimate job advert.",
  },
  likely_legit: {
    icon: ShieldCheck,
    label: "Low Risk",
    color: "bg-green-100 text-green-800 border-green-200",
    description: "Risk analysis indicates low likelihood of fraud. Verify independently before proceeding.",
  },
  needs_review: {
    icon: Search,
    label: "Moderate Risk",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    description: "Some concerns detected. Review carefully and verify company details independently.",
  },
  suspicious: {
    icon: AlertTriangle,
    label: "Moderate Risk",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    description: "Multiple warning signs detected. Proceed with extreme caution.",
  },
  high_risk_scam: {
    icon: XCircle,
    label: "High Risk",
    color: "bg-red-100 text-red-800 border-red-200",
    description: "Strong indicators of fraudulent activity. Do not engage with this advert.",
  },
};

export default function ResultPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // ✅ guest vs logged-in
  const isLoggedIn = !!user;

  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);

  useEffect(() => {
    if (id) {
      fetchResult();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchResult = async () => {
    try {
      const data = await apiGetVerification(id!);
      setResult({
        ...data,
        verdict: data.verdict as Verdict,
        indicators: data.indicators || [],
      });
    } catch (error: any) {
      console.error("Error fetching result:", error);
      toast({
        title: "Not Found",
        description: "Verification result not found",
        variant: "destructive",
      });
      navigate("/verify");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      // guests shouldn't even see the button, but keep this as safety
      toast({
        title: "Login Required",
        description: "Please log in to save verification results",
      });
      navigate("/login");
      return;
    }

    setSaving(true);
    try {
      await apiSaveVerification(id!);
      setResult((prev) => (prev ? { ...prev, saved: true } : null));
      toast({
        title: "Saved",
        description: "Verification result saved to your history",
      });
    } catch (error: any) {
      console.error("Error saving:", error);
      toast({
        title: "Error",
        description: "Failed to save result",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReportClick = () => {
    if (!user) {
      // guests shouldn't even see the button, but keep this as safety
      toast({
        title: "Login Required",
        description: "Please log in to report job adverts",
      });
      navigate("/login");
      return;
    }
    setShowReportDialog(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  if (!result) return null;

  const config = verdictConfig[result.verdict] || verdictConfig.likely_legit;

  const isLegit = result.risk_score === 0;
  const displayLabel = isLegit ? "Legit" : config.label;
  const displayDescription = isLegit
    ? "No risk indicators detected. This appears to be a legitimate job advert."
    : config.description;

  const VerdictIcon = config.icon;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 hero-gradient py-12">
        <div className="container max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Back Link */}
            <Link
              to="/verify"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Verify Another Job
            </Link>

            {/* DANGER Alert Banner for Scams */}
            {result.verdict === "high_risk_scam" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="mb-6"
              >
                <motion.div
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(239, 68, 68, 0.4)",
                      "0 0 0 10px rgba(239, 68, 68, 0)",
                      "0 0 0 0 rgba(239, 68, 68, 0)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="bg-red-600 text-white rounded-xl p-6 border-2 border-red-700"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Skull className="w-8 h-8" />
                    <h2 className="text-xl md:text-2xl font-bold">
                      🚨 DANGER: LIKELY SCAM DETECTED
                    </h2>
                  </div>
                  <p className="text-red-100 text-lg">
                    Do <strong>NOT</strong> share personal information or make any payments to this recruiter.
                  </p>
                </motion.div>
              </motion.div>
            )}

            {/* Warning Banner for Suspicious Jobs */}
            {result.verdict === "suspicious" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="mb-6"
              >
                <div className="bg-orange-500 text-white rounded-xl p-6 border-2 border-orange-600">
                  <div className="flex items-center gap-3 mb-3">
                    <AlertOctagon className="w-7 h-7" />
                    <h2 className="text-xl font-bold">
                      ⚠️ WARNING: Multiple Red Flags Detected
                    </h2>
                  </div>
                  <p className="text-orange-100">
                    Proceed with extreme caution. Verify this opportunity through official company channels.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Result Card */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-lg">
              {/* Verdict Badge */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="inline-block"
                >
                  <Badge className={`${config.color} px-6 py-3 text-lg font-semibold gap-2`}>
                    <VerdictIcon className="w-5 h-5" />
                    {displayLabel}
                  </Badge>
                </motion.div>
                <p className="text-muted-foreground mt-4">{displayDescription}</p>
              </div>

              {/* Risk Meter */}
              <div className="mb-8">
                <RiskMeter score={result.risk_score} />
              </div>

              {/* Disclaimer Banner */}
              <div className="mb-8 p-4 bg-muted/50 rounded-lg border border-border flex items-start gap-3">
                <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  <strong>⚠️ Automated screening result</strong> — always verify independently through official company channels before sharing personal information or making any payments.
                </p>
              </div>

              {/* Indicators */}
              {result.indicators.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-semibold mb-4">Risk Indicators Found</h3>
                  <ul className="space-y-2">
                    {result.indicators.map((indicator, index) => {
                      const isStructured = typeof indicator === "object" && indicator.title;
                      const title = isStructured ? indicator.title : indicator;
                      const matches = isStructured ? indicator.matches : [];
                      const explanation = isStructured ? indicator.explanation : "";

                      return (
                        <ExpandableIndicator
                          key={index}
                          index={index}
                          title={title}
                          matches={matches}
                          explanation={explanation}
                        />
                      );
                    })}
                  </ul>
                </div>
              )}

              {result.indicators.length === 0 && (
                <div className="mb-8 p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-green-800 text-sm">
                    No significant red flags were detected in this job advert. However, always verify through official channels.
                  </p>
                </div>
              )}

              {/* Submitted Content */}
              {(result.advert_text || result.advert_link) && (
                <div className="mb-8">
                  <h3 className="font-semibold mb-4">Submitted Content</h3>
                  <div className="bg-muted/30 rounded-lg border border-border p-4 max-h-60 overflow-y-auto">
                    {result.advert_text && (
                      <p className="text-sm whitespace-pre-wrap text-muted-foreground">{result.advert_text}</p>
                    )}
                    {result.advert_link && (
                      <p className="text-sm text-primary mt-2 break-all">{result.advert_link}</p>
                    )}
                  </div>
                </div>
              )}

              {/* ✅ FINAL: Actions ONLY for logged-in users (no guest message) */}
              {isLoggedIn && (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="outline" className="flex-1" onClick={handleReportClick}>
                    <Flag className="w-4 h-4 mr-2" />
                    Report This Advert
                  </Button>

                  <Button
                    className="flex-1"
                    onClick={handleSave}
                    disabled={saving || result.saved}
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {result.saved ? "Saved" : "Save Result"}
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>

      {/* ✅ Report dialog ONLY for logged-in users */}
      {isLoggedIn && (
        <ReportDialog
          open={showReportDialog}
          onOpenChange={setShowReportDialog}
          verificationId={id!}
        />
      )}
    </div>
  );
}
