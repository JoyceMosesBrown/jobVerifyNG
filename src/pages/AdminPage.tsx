import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  apiGetAdminReports,
  apiResolveReport,
  apiGetAdminVerifications,
  apiGetBlacklist,
  apiAddToBlacklist,
  apiDeleteBlacklist,
} from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Shield,
  Flag,
  Ban,
  CheckCircle,
  Loader2,
  Plus,
  Trash2,
  Eye,
} from "lucide-react";
import { format } from "date-fns";

interface Report {
  id: string;
  verification_id: string;
  report_type: string;
  status: string;
  message: string | null;
  created_at: string;
  verification_results?: {
    advert_text: string | null;
    recruiter_email: string | null;
    recruiter_phone: string | null;
  };
}

interface BlacklistItem {
  id: string;
  type: string;
  value: string;
  created_at: string;
}

export default function AdminPage() {
  const { user, userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"reports" | "blacklist" | "verifications">("reports");
  const [reports, setReports] = useState<Report[]>([]);
  const [blacklist, setBlacklist] = useState<BlacklistItem[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showAddBlacklist, setShowAddBlacklist] = useState(false);
  const [newBlacklistType, setNewBlacklistType] = useState<string>("email");
  const [newBlacklistValue, setNewBlacklistValue] = useState("");
  const [addingBlacklist, setAddingBlacklist] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && userRole === "admin") {
      fetchData();
    }
  }, [user, userRole, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "reports") {
        const data = await apiGetAdminReports();
        setReports(data || []);
      } else if (activeTab === "verifications") {
        const data = await apiGetAdminVerifications();
        setVerifications(data || []);
      } else {
        const data = await apiGetBlacklist();
        setBlacklist(data || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkResolved = async (reportId: string) => {
    try {
      await apiResolveReport(reportId);
      toast({ title: "Report marked as resolved" });
      fetchData();
      setSelectedReport(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update report",
        variant: "destructive",
      });
    }
  };

  const handleAddToBlacklist = async (type: string, value: string) => {
    try {
      await apiAddToBlacklist(type, value);
      toast({ title: "Added to blacklist" });
      setSelectedReport(null);
      if (activeTab === "blacklist") fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add to blacklist",
        variant: "destructive",
      });
    }
  };

  const handleAddNewBlacklist = async () => {
    if (!newBlacklistValue.trim()) {
      toast({
        title: "Error",
        description: "Please enter a value",
        variant: "destructive",
      });
      return;
    }

    setAddingBlacklist(true);
    try {
      await handleAddToBlacklist(newBlacklistType, newBlacklistValue);
      setNewBlacklistValue("");
      setShowAddBlacklist(false);
      fetchData();
    } finally {
      setAddingBlacklist(false);
    }
  };

  const handleDeleteBlacklist = async (id: string) => {
    try {
      await apiDeleteBlacklist(id);
      toast({ title: "Removed from blacklist" });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove from blacklist",
        variant: "destructive",
      });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user && userRole === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user && userRole !== "admin") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground mb-4">You don't have admin privileges.</p>
            <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="container">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage reports, verifications, and blacklist</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-4 mb-8">
            <Button
              variant={activeTab === "reports" ? "default" : "outline"}
              onClick={() => setActiveTab("reports")}
            >
              <Flag className="w-4 h-4 mr-2" />
              Reports ({reports.length})
            </Button>
            <Button
              variant={activeTab === "verifications" ? "default" : "outline"}
              onClick={() => setActiveTab("verifications")}
            >
              <Eye className="w-4 h-4 mr-2" />
              Verifications ({verifications.length})
            </Button>
            <Button
              variant={activeTab === "blacklist" ? "default" : "outline"}
              onClick={() => setActiveTab("blacklist")}
            >
              <Ban className="w-4 h-4 mr-2" />
              Blacklist ({blacklist.length})
            </Button>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : activeTab === "reports" ? (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No reports yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          {format(new Date(report.created_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="capitalize">{report.report_type}</TableCell>
                        <TableCell>
                          <Badge
                            variant={report.status === "resolved" ? "default" : "secondary"}
                          >
                            {report.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {report.message || "No additional details"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedReport(report)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          ) : activeTab === "verifications" ? (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Verdict</TableHead>
                    <TableHead>Risk Score</TableHead>
                    <TableHead>Recruiter Email</TableHead>
                    <TableHead>Recruiter Phone</TableHead>
                    <TableHead>Advert Preview</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {verifications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No verifications yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    verifications.map((v: any) => (
                      <TableRow key={v.id}>
                        <TableCell>
                          {format(new Date(v.created_at), "MMM d, yyyy HH:mm")}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              v.verdict === "verified" || v.verdict === "likely_legit"
                                ? "default"
                                : v.verdict === "suspicious"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {v.verdict?.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={`font-bold ${v.risk_score >= 60 ? "text-destructive" : v.risk_score >= 30 ? "text-warning" : "text-primary"}`}>
                            {v.risk_score}%
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{v.recruiter_email || "-"}</TableCell>
                        <TableCell className="font-mono text-sm">{v.recruiter_phone || "-"}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                          {v.advert_text?.substring(0, 50) || "-"}...
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => setShowAddBlacklist(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Blacklist
                </Button>
              </div>

              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Added</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blacklist.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          No blacklisted items yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      blacklist.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="capitalize">{item.type}</TableCell>
                          <TableCell>{item.value}</TableCell>
                          <TableCell>
                            {format(new Date(item.created_at), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteBlacklist(item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Report Detail Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">{selectedReport.report_type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge
                    variant={selectedReport.status === "resolved" ? "default" : "secondary"}
                  >
                    {selectedReport.status}
                  </Badge>
                </div>
              </div>

              {selectedReport.message && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Message</p>
                  <p className="bg-muted p-3 rounded-lg">{selectedReport.message}</p>
                </div>
              )}

              {selectedReport.verification_results && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Job Advert Text</p>
                  <p className="bg-muted p-3 rounded-lg text-sm max-h-32 overflow-y-auto">
                    {selectedReport.verification_results.advert_text || "N/A"}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {selectedReport.verification_results?.recruiter_email && (
                  <div>
                    <p className="text-sm text-muted-foreground">Recruiter Email</p>
                    <p className="font-mono text-sm">
                      {selectedReport.verification_results.recruiter_email}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      onClick={() =>
                        handleAddToBlacklist(
                          "email",
                          selectedReport.verification_results!.recruiter_email!
                        )
                      }
                    >
                      <Ban className="w-3 h-3 mr-1" />
                      Add to Blacklist
                    </Button>
                  </div>
                )}
                {selectedReport.verification_results?.recruiter_phone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Recruiter Phone</p>
                    <p className="font-mono text-sm">
                      {selectedReport.verification_results.recruiter_phone}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      onClick={() =>
                        handleAddToBlacklist(
                          "phone",
                          selectedReport.verification_results!.recruiter_phone!
                        )
                      }
                    >
                      <Ban className="w-3 h-3 mr-1" />
                      Add to Blacklist
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t">
                {selectedReport.status !== "resolved" && (
                  <Button onClick={() => handleMarkResolved(selectedReport.id)}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Resolved
                  </Button>
                )}
                <Button variant="outline" onClick={() => setSelectedReport(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Blacklist Dialog */}
      <Dialog open={showAddBlacklist} onOpenChange={setShowAddBlacklist}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Blacklist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Select value={newBlacklistType} onValueChange={setNewBlacklistType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="domain">Domain</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input
              value={newBlacklistValue}
              onChange={(e) => setNewBlacklistValue(e.target.value)}
              placeholder={`Enter ${newBlacklistType}...`}
            />
            <div className="flex gap-3">
              <Button
                onClick={handleAddNewBlacklist}
                disabled={addingBlacklist}
                className="flex-1"
              >
                {addingBlacklist ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Add to Blacklist"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAddBlacklist(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
