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
import { ShieldCheck, Link as LinkIcon, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { apiVerify } from "@/lib/api";
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

type InputType = "text" | "link";

export function VerifyForm() {
  const [inputType, setInputType] = useState<InputType>("text");
  const [advertText, setAdvertText] = useState("");
  const [advertLink, setAdvertLink] = useState("");
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

    setIsLoading(true);

    try {
      const data = await apiVerify({
        advertText: inputType === "text" ? advertText : null,
        advertLink: inputType === "link" ? advertLink : null,
        sourcePlatform: platform,
        recruiterEmail,
        recruiterPhone,
        userId: user?.id || null,
      });

      // Navigate to result page with the verification ID
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
      <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-lg">
        {/* Input Type Toggle */}
        <div className="mb-6">
          <Label className="text-sm font-medium mb-3 block">What do you have?</Label>
          <div className="grid grid-cols-2 gap-4">
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
          </div>
        </div>

        {/* Text or Link Input */}
        {inputType === "text" ? (
          <div className="mb-6">
            <Label htmlFor="advertText" className="mb-2 block">Paste Job Advert Text</Label>
            <Textarea
              id="advertText"
              value={advertText}
              onChange={(e) => setAdvertText(e.target.value)}
              placeholder="Paste the entire job advert here... e.g., 'We are hiring! Work from home and earn ₦500,000 monthly...'"
              className="min-h-[180px] resize-none"
            />
          </div>
        ) : (
          <div className="mb-6">
            <Label htmlFor="advertLink" className="mb-2 block">Paste Job Link / URL</Label>
            <Input
              id="advertLink"
              type="url"
              value={advertLink}
              onChange={(e) => setAdvertLink(e.target.value)}
              placeholder="https://example.com/job-posting"
            />
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
            <Label htmlFor="recruiterEmail" className="mb-2 block">Recruiter Email (Optional)</Label>
            <Input
              id="recruiterEmail"
              type="email"
              value={recruiterEmail}
              onChange={(e) => setRecruiterEmail(e.target.value)}
              placeholder="recruiter@example.com"
            />
          </div>
          <div>
            <Label htmlFor="recruiterPhone" className="mb-2 block">Recruiter Phone (Optional)</Label>
            <Input
              id="recruiterPhone"
              type="tel"
              value={recruiterPhone}
              onChange={(e) => setRecruiterPhone(e.target.value)}
              placeholder="+234..."
            />
          </div>
        </div>

        {/* Submit Button */}
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

        <p className="text-center text-sm text-muted-foreground mt-4">
          ✔ Verifies job adverts in seconds · ✔ Flags common scam patterns · ✔ Helps users make informed decisions
        </p>
      </form>
    </motion.div>
  );
}
