import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Users,
  Flag,
  Ban,
  AlertTriangle,
  Loader2,
  Trash2,
  CheckCircle,
  Plus,
  FileSearch,
  Mail,
  Eye,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  apiGetAdminStats,
  apiGetAdminVerifications,
  apiGetAdminReports,
  apiGetBlacklist,
  apiAddToBlacklist,
  apiDeleteBlacklist,
  apiResolveReport,
  apiGetAdminMessages,
  apiMarkMessageRead,
  apiDeleteMessage,
  apiReplyToMessage,
  AdminStats,
} from "@/lib/api";

const verdictColors: Record<string, string> = {
  likely_legit: "bg-green-100 text-green-800",
  needs_review: "bg-yellow-100 text-yellow-800",
  suspicious: "bg-yellow-100 text-yellow-800",
  high_risk_scam: "bg-red-100 text-red-800",
};

const verdictLabels: Record<string, string> = {
  likely_legit: "Low Risk",
  needs_review: "Moderate Risk",
  suspicious: "Moderate Risk",
  high_risk_scam: "High Risk",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  reviewed: "bg-blue-100 text-blue-800",
  resolved: "bg-green-100 text-green-800",
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AdminPage() {
  const { user, userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [blacklist, setBlacklist] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Blacklist form
  const [newType, setNewType] = useState("email");
  const [newValue, setNewValue] = useState("");
  const [adding, setAdding] = useState(false);

  // Reply modal
  const [replyingTo, setReplyingTo] = useState<any | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/login");
      } else if (userRole !== "admin") {
        navigate("/dashboard");
      }
    }
  }, [user, userRole, authLoading, navigate]);

  // Fetch all data
  useEffect(() => {
    if (user && userRole === "admin") {
      fetchAllData();
    }
  }, [user, userRole]);

  const fetchAllData = async () => {
    try {
      const [statsData, verificationsData, reportsData, blacklistData, messagesData] =
        await Promise.all([
          apiGetAdminStats(),
          apiGetAdminVerifications(),
          apiGetAdminReports(),
          apiGetBlacklist(),
          apiGetAdminMessages(),
        ]);
      setStats(statsData);
      setVerifications(verificationsData);
      setReports(reportsData);
      setBlacklist(blacklistData);
      setMessages(messagesData);
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await apiResolveReport(id);
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "resolved" } : r))
      );
      setStats((prev) =>
        prev ? { ...prev, pendingReports: prev.pendingReports - 1 } : prev
      );
      toast({ title: "Report resolved" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resolve report",
        variant: "destructive",
      });
    }
  };

  const handleAddBlacklist = async () => {
    if (!newValue.trim()) return;
    setAdding(true);
    try {
      await apiAddToBlacklist(newType, newValue.trim());
      setNewValue("");
      const data = await apiGetBlacklist();
      setBlacklist(data);
      setStats((prev) =>
        prev ? { ...prev, blacklistCount: prev.blacklistCount + 1 } : prev
      );
      toast({ title: "Added to blacklist" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to add to blacklist",
        variant: "destructive",
      });
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteBlacklist = async (id: string) => {
    try {
      await apiDeleteBlacklist(id);
      setBlacklist((prev) => prev.filter((b) => b.id !== id));
      setStats((prev) =>
        prev ? { ...prev, blacklistCount: prev.blacklistCount - 1 } : prev
      );
      toast({ title: "Removed from blacklist" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove from blacklist",
        variant: "destructive",
      });
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await apiMarkMessageRead(id);
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: "read" } : m))
      );
      toast({ title: "Marked as read" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update message",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      await apiDeleteMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      toast({ title: "Message deleted" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive",
      });
    }
  };

  const handleReply = async () => {
    if (!replyingTo || !replyText.trim()) return;
    setReplying(true);
    try {
      await apiReplyToMessage(replyingTo.id, replyText.trim());
      setMessages((prev) =>
        prev.map((m) =>
          m.id === replyingTo.id
            ? { ...m, status: "replied", admin_reply: replyText.trim(), replied_at: new Date().toISOString() }
            : m
        )
      );
      toast({ title: "Reply sent" });
      setReplyingTo(null);
      setReplyText("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send reply",
        variant: "destructive",
      });
    } finally {
      setReplying(false);
    }
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  if (!user || userRole !== "admin") {
    return null;
  }

  const statCards = [
    {
      label: "Total Verifications",
      value: stats?.totalVerifications ?? 0,
      icon: ShieldCheck,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "Total Users",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      label: "Pending Reports",
      value: stats?.pendingReports ?? 0,
      icon: Flag,
      color: "bg-yellow-500/10 text-yellow-500",
    },
    {
      label: "Blacklisted Entities",
      value: stats?.blacklistCount ?? 0,
      icon: Ban,
      color: "bg-red-500/10 text-red-500",
    },
    {
      label: "Scams Detected",
      value: stats?.scamsDetected ?? 0,
      icon: AlertTriangle,
      color: "bg-destructive/10 text-destructive",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage verifications, reports, and blacklist entries
            </p>
          </motion.div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="verifications">Verifications</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="blacklist">Blacklist</TabsTrigger>
              <TabsTrigger value="messages">
                Messages
                {messages.filter((m) => m.status === "unread").length > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-destructive text-destructive-foreground rounded-full">
                    {messages.filter((m) => m.status === "unread").length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* ===== OVERVIEW TAB ===== */}
            <TabsContent value="overview">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {statCards.map((card, i) => (
                  <motion.div
                    key={card.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`bg-card rounded-xl border border-border p-6 ${
                      i === 4 ? "col-span-2 md:col-span-1" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${card.color}`}>
                        <card.icon className="w-5 h-5" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold">{card.value}</p>
                    <p className="text-sm text-muted-foreground">
                      {card.label}
                    </p>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* ===== VERIFICATIONS TAB ===== */}
            <TabsContent value="verifications">
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                {verifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <FileSearch className="w-12 h-12 mb-3" />
                    <p>No verifications yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Advert</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Verdict</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {verifications.map((v) => (
                        <TableRow
                          key={v.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => navigate(`/result/${v.id}`)}
                        >
                          <TableCell className="max-w-[250px] truncate font-medium">
                            {v.advert_text?.substring(0, 60) ||
                              v.advert_link ||
                              "—"}
                          </TableCell>
                          <TableCell>
                            {v.user?.name || (
                              <span className="text-muted-foreground">
                                Anonymous
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold">{v.risk_score}</span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                verdictColors[v.verdict] ||
                                "bg-gray-100 text-gray-800"
                              }
                            >
                              {verdictLabels[v.verdict] || v.verdict}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(v.created_at)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </TabsContent>

            {/* ===== REPORTS TAB ===== */}
            <TabsContent value="reports">
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                {reports.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <Flag className="w-12 h-12 mb-3" />
                    <p>No reports yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Advert Preview</TableHead>
                        <TableHead>Reporter</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell>
                            <Badge
                              variant={
                                r.report_type === "scam"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {r.report_type}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {r.verification?.advert_text || "—"}
                          </TableCell>
                          <TableCell>
                            {r.user?.name || (
                              <span className="text-muted-foreground">
                                Anonymous
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="max-w-[180px] truncate">
                            {r.message || (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[r.status] || ""}>
                              {r.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(r.created_at)}
                          </TableCell>
                          <TableCell>
                            {r.status !== "resolved" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleResolve(r.id)}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Resolve
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </TabsContent>

            {/* ===== BLACKLIST TAB ===== */}
            <TabsContent value="blacklist" className="space-y-6">
              {/* Add new entry */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add to Blacklist
                </h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Select value={newType} onValueChange={setNewType}>
                    <SelectTrigger className="w-full sm:w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="domain">Domain</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder={
                      newType === "email"
                        ? "scammer@example.com"
                        : newType === "phone"
                        ? "+234..."
                        : "scam-domain.com"
                    }
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddBlacklist()}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleAddBlacklist}
                    disabled={adding || !newValue.trim()}
                  >
                    {adding ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-1" />
                    ) : (
                      <Plus className="w-4 h-4 mr-1" />
                    )}
                    Add
                  </Button>
                </div>
              </div>

              {/* Blacklist table */}
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                {blacklist.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <Ban className="w-12 h-12 mb-3" />
                    <p>Blacklist is empty</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Added By</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {blacklist.map((b) => (
                        <TableRow key={b.id}>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {b.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {b.value}
                          </TableCell>
                          <TableCell>{b.added_by}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(b.created_at)}
                          </TableCell>
                          <TableCell>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Remove from blacklist?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to remove{" "}
                                    <strong>{b.value}</strong> from the
                                    blacklist? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteBlacklist(b.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Remove
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </TabsContent>

            {/* ===== MESSAGES TAB ===== */}
            <TabsContent value="messages">
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <Mail className="w-12 h-12 mb-3" />
                    <p>No messages yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {messages.map((m) => (
                        <TableRow
                          key={m.id}
                          className={m.status === "unread" ? "bg-primary/5" : ""}
                        >
                          <TableCell>
                            <Badge
                              className={
                                m.status === "unread"
                                  ? "bg-blue-100 text-blue-800"
                                  : m.status === "read"
                                  ? "bg-gray-100 text-gray-800"
                                  : "bg-green-100 text-green-800"
                              }
                            >
                              {m.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{m.name}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {m.email}
                          </TableCell>
                          <TableCell className="max-w-[300px]">
                            <p className="truncate">{m.message}</p>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(m.created_at)}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {m.status === "unread" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleMarkRead(m.id)}
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  Read
                                </Button>
                              )}
                              {m.status !== "replied" ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setReplyingTo(m);
                                    setReplyText("");
                                  }}
                                >
                                  <Mail className="w-4 h-4 mr-1" />
                                  Reply
                                </Button>
                              ) : (
                                <span className="text-xs text-green-600 font-medium">
                                  Replied
                                </span>
                              )}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Delete this message?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete the message
                                      from <strong>{m.name}</strong>. This action
                                      cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteMessage(m.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Reply Modal */}
          {replyingTo && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-lg mx-4 p-6">
                <h3 className="text-lg font-bold mb-1">Reply to {replyingTo.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {replyingTo.email}
                </p>

                <div className="bg-muted/50 rounded-lg p-3 mb-4">
                  <p className="text-xs text-muted-foreground mb-1 font-medium">Their message:</p>
                  <p className="text-sm">{replyingTo.message}</p>
                </div>

                <div className="mb-4">
                  <Label className="text-sm font-medium">Your Reply</Label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply here..."
                    rows={4}
                    className="mt-2 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                  />
                </div>

                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyText("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleReply}
                    disabled={replying || !replyText.trim()}
                  >
                    {replying ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Send Reply
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
