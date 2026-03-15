import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShieldCheck, Link as LinkIcon, Loader2, Upload, Clipboard } from "lucide-react";
import { motion } from "framer-motion";
import { apiVerify, apiVerifyDocument } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const platforms = [
  "WhatsApp",
  "Telegram",
  "Facebook",
  "Twitter/X",
  "Instagram",
  "LinkedIn",
  "Email",
  "Job Website",
  "Other",
];

type InputType = "text" | "link" | "document";

export function VerifyForm() {
  const [inputType, setInputType] = useState<InputType>("text");
  const [advertText, setAdvertText] = useState("");
  const [advertLink, setAdvertLink] = useState("");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [platform, setPlatform] = useState("");
  const [recruiterEmail, setRecruiterEmail] = useState("");
  const [recruiterPhone, setRecruiterPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (inputType === "text" && !advertText.trim()) {
      toast({
        title: "Error",
        description: "Please enter the job advert text",
        variant: "destructive",
      });
      return;
    }

    if (inputType === "link" && !advertLink.trim()) {
      toast({
        title: "Error",
        description: "Please enter the job advert link",
        variant: "destructive",
      });
      return;
    }

    if (inputType === "document" && !documentFile) {
      toast({
        title: "Error",
        description: "Please upload a document or screenshot",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (inputType === "document") {
        const formData = new FormData();
        formData.append("document", documentFile as File);
        formData.append("sourcePlatform", platform || "document");
        formData.append("recruiterEmail", recruiterEmail || "");
        formData.append("recruiterPhone", recruiterPhone || "");
        formData.append("userId", user?.id || "");

        const data = await apiVerifyDocument(formData);

        if (data?.id) {
          navigate(`/result/${data.id}`);
        } else {
          toast({
            title: "Document Processed",
            description: data?.message || "Document uploaded successfully",
          });
        }

        return;
      }

      const data = await apiVerify({
        advertText: inputType === "text" ? advertText : null,
        advertLink: inputType === "link" ? advertLink : null,
        sourcePlatform: platform,
        recruiterEmail,
        recruiterPhone,
        userId: user?.id || null,
      });

      navigate(`/result/${data.id}`);
    } catch (error: any) {
      console.error("Verification error:", error);
      toast({
        title: "Verification Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <form
        onSubmit={handleSubmit}
        className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-lg"
      >
        {/* Input Type Toggle */}
        <div className="mb-6">
          <Label className="text-sm font-medium mb-3 block">
            What do you have?
          </Label>

          <div className="grid grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setInputType("text")}
              className={`flex items-center justify-center gap-2 py-4 px-4 rounded-xl border-2 transition-all ${
                inputType === "text"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border hover:border-muted-foreground/30"
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
              <span className="font-medium">Job Advert Text</span>
            </button>

            <button
              type="button"
              onClick={() => setInputType("link")}
              className={`flex items-center justify-center gap-2 py-4 px-4 rounded-xl border-2 transition-all ${
                inputType === "link"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border hover:border-muted-foreground/30"
              }`}
            >
              <LinkIcon className="w-5 h-5" />
              <span className="font-medium">Job Link / URL</span>
            </button>

            <button
              type="button"
              onClick={() => setInputType("document")}
              className={`flex items-center justify-center gap-2 py-4 px-4 rounded-xl border-2 transition-all ${
                inputType === "document"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border hover:border-muted-foreground/30"
              }`}
            >
              <Upload className="w-5 h-5" />
              <span className="font-medium">Upload File</span>
            </button>
          </div>
        </div>

        {/* Dynamic Input Section */}
        {inputType === "text" ? (
          <div className="mb-6">
            <Label className="mb-2 block">Paste Job Advert Text</Label>
            <Textarea
              value={advertText}
              onChange={(e) => setAdvertText(e.target.value)}
              className="min-h-[180px]"
            />
          </div>
        ) : inputType === "link" ? (
          <div className="mb-6">
            <Label className="mb-2 block">Paste Job Link / URL</Label>
            <Input
              type="url"
              value={advertLink}
              onChange={(e) => setAdvertLink(e.target.value)}
            />
          </div>
        ) : (
          <div className="mb-6 space-y-4">
            {/* File Upload */}
            <div>
              <Label className="mb-2 block">Upload from Device</Label>
              <Input
                type="file"
                accept="application/pdf,image/png,image/jpeg,image/webp"
                onChange={(e) =>
                  setDocumentFile(e.target.files?.[0] || null)
                }
              />
              <p className="text-xs mt-1 text-muted-foreground">
                Supports PDF, PNG, JPG, WEBP
              </p>
              {documentFile && documentFile.name !== "image.png" && (
                <p className="text-sm mt-2 text-muted-foreground">
                  Selected: {documentFile.name}
                </p>
              )}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-border" />
              <span className="text-xs text-muted-foreground">OR</span>
              <div className="flex-1 border-t border-border" />
            </div>

            {/* Paste Screenshot */}
            <div>
              <Label className="mb-2 block">Paste Screenshot</Label>
              <div
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                tabIndex={0}
                onPaste={(e) => {
                  const items = e.clipboardData?.items;
                  if (!items) return;
                  for (const item of items) {
                    if (item.type.startsWith("image/")) {
                      const file = item.getAsFile();
                      if (file) {
                        setDocumentFile(file);
                        toast({
                          title: "Image Pasted",
                          description: "Screenshot pasted successfully",
                        });
                      }
                      break;
                    }
                  }
                }}
              >
                <span className="text-muted-foreground">
                  {documentFile && documentFile.name === "image.png"
                    ? "Screenshot pasted"
                    : "Click here and paste your screenshot"}
                </span>
              </div>
              {documentFile && documentFile.name === "image.png" && (
                <div className="mt-3 space-y-2">
                  <div className="relative rounded-lg overflow-hidden border border-border">
                    <img
                      src={URL.createObjectURL(documentFile)}
                      alt="Pasted screenshot"
                      className="w-full max-h-60 object-contain bg-muted/30"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-primary font-medium">Screenshot ready</span>
                    <button
                      type="button"
                      onClick={() => setDocumentFile(null)}
                      className="text-xs text-muted-foreground hover:text-destructive"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Platform Select */}
        <div className="mb-6">
          <Label className="mb-2 block">Where did you find this?</Label>
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger>
              <SelectValue placeholder="Select source..." />
            </SelectTrigger>
            <SelectContent>
              {platforms.map((p) => (
                <SelectItem key={p} value={p.toLowerCase()}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Optional Fields */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div>
            <Label className="mb-2 block">Recruiter Email (Optional)</Label>
            <Input
              type="email"
              value={recruiterEmail}
              onChange={(e) => setRecruiterEmail(e.target.value)}
            />
          </div>
          <div>
            <Label className="mb-2 block">Recruiter Phone (Optional)</Label>
            <Input
              type="tel"
              value={recruiterPhone}
              onChange={(e) => setRecruiterPhone(e.target.value)}
            />
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <ShieldCheck className="w-5 h-5 mr-2" />
              Verify This Job Advert
            </>
          )}
        </Button>
      </form>
    </motion.div>
  );
}