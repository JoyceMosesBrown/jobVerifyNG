import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiGetDashboard } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import {
  ShieldCheck,
  History,
  Flag,
  User,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

interface Verification {
  id: string;
  verdict: string;
  risk_score: number;
  created_at: string;
  advert_text: string | null;
}

interface Report {
  id: string;
  report_type: string;
  status: string;
  created_at: string;
}

const verdictColors: Record<string, string> = {
  verified: "bg-green-100 text-green-800",
  likely_legit: "bg-green-100 text-green-800",
  needs_review: "bg-blue-100 text-blue-800",
  suspicious: "bg-yellow-100 text-yellow-800",
  high_risk_scam: "bg-red-100 text-red-800",
};

const verdictLabels: Record<string, string> = {
  verified: "Low Risk",
  likely_legit: "Low Risk",
  needs_review: "Medium Risk",
  suspicious: "High Risk",
  high_risk_scam: "Very High Risk",
};

const getVerdictLabel = (verdict: string, riskScore: number): string => {
  if (riskScore === 0) {
    return "Legit";
  }
  return verdictLabels[verdict] || verdict.replace("_", " ");
};

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVerifications: 0,
    scamsDetected: 0,
    reportsSubmitted: 0,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/login");
      }
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const data = await apiGetDashboard();
      setVerifications(data.verifications);
      setReports(data.reports);
      setStats(data.stats);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="container">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's an overview of your verification history.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl border border-border p-6"
            >
              <div className="flex items-center gap-4">
                <div className="icon-container">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalVerifications}</p>
                  <p className="text-sm text-muted-foreground">Total Verifications</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-xl border border-border p-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive">
                  <Flag className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.scamsDetected}</p>
                  <p className="text-sm text-muted-foreground">Scams Detected</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-xl border border-border p-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-secondary-foreground">
                  <History className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.reportsSubmitted}</p>
                  <p className="text-sm text-muted-foreground">Reports Submitted</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card rounded-xl border border-border p-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium truncate max-w-[150px]">{user?.email}</p>
                  <p className="text-sm text-muted-foreground">User Account</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Content Grid */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Verification History */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Verification History</h2>
                <Link to="/verify">
                  <Button size="sm">New Verification</Button>
                </Link>
              </div>

              {verifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ShieldCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No saved verifications yet</p>
                  <Link to="/verify" className="text-primary hover:underline text-sm">
                    Verify your first job advert →
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {verifications.map((v) => (
                    <Link
                      key={v.id}
                      to={`/result/${v.id}`}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {v.advert_text?.substring(0, 50) || "Job Verification"}...
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(v.created_at), "MMM d, yyyy")}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={verdictColors[v.verdict] || "bg-muted text-muted-foreground"}>
                          {getVerdictLabel(v.verdict, v.risk_score)}
                        </Badge>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Reports History */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold mb-6">Your Reports</h2>

              {reports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Flag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No reports submitted yet</p>
                  <p className="text-sm">Reports help us protect the community</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border"
                    >
                      <div>
                        <p className="text-sm font-medium capitalize">
                          {r.report_type} Report
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(r.created_at), "MMM d, yyyy")}
                        </p>
                      </div>
                      <Badge
                        variant={r.status === "resolved" ? "default" : "secondary"}
                      >
                        {r.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
