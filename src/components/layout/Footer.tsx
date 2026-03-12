import { Link } from "react-router-dom";
import { ShieldCheck, Mail, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="footer-gradient text-primary-foreground">
      <div className="container py-8">
        {/* Main footer content */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          {/* Brand */}
          <div className="space-y-2 max-w-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-primary-foreground/20 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">JobVerify NG</span>
            </div>
            <p className="text-primary-foreground/70 text-xs leading-relaxed">
              Don't let scammers waste your time or money. Verify every job advert before you apply. It's free, fast, and could save you from fraud.
            </p>
            <div className="flex gap-2 pt-1">
              <a href="mailto:support@jobverify.ng" className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
                <Mail className="w-3.5 h-3.5" />
              </a>
              <a href="https://twitter.com/jobverifyng" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
                <Twitter className="w-3.5 h-3.5" />
              </a>
              <a href="https://linkedin.com/company/jobverifyng" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
                <Linkedin className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="flex gap-8 text-sm">
            <div className="flex flex-col gap-2 text-primary-foreground/70">
              <Link to="/about" className="hover:text-primary-foreground transition-colors">About Us</Link>
              <Link to="/contact" className="hover:text-primary-foreground transition-colors">Contact Us</Link>
            </div>
            <div className="flex flex-col gap-2 text-primary-foreground/70">
              <Link to="/terms" className="hover:text-primary-foreground transition-colors">Terms</Link>
              <Link to="/privacy" className="hover:text-primary-foreground transition-colors">Privacy</Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-primary-foreground/15 mt-6 pt-4 text-center text-xs text-primary-foreground/50">
          © 2026 JobVerify NG. All rights reserved. Made with ❤️ in Nigeria.
        </div>
      </div>
    </footer>
  );
}
