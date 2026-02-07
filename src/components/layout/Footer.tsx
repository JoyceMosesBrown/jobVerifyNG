import { Link } from "react-router-dom";
import { ShieldCheck, Mail, Twitter, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="footer-gradient text-primary-foreground">
      {/* CTA Section */}
      <div className="py-16 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Stay Safe from Job Scams</h2>
        <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
          Don't let scammers waste your time or money. Verify every job advert before you apply. It's free, fast, and could save you from fraud.
        </p>
        <Link to="/verify">
          <Button
            variant="outline"
            size="lg"
            className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
          >
            Verify a Job Now
          </Button>
        </Link>
      </div>

      {/* Main Footer */}
      <div className="border-t border-primary-foreground/20">
        <div className="container py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">JobVerify NG</span>
            </div>
            <p className="text-primary-foreground/70 text-sm">
              Nigeria's #1 job verification platform. We help job seekers avoid scams and find legitimate opportunities.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="font-semibold mb-4">Platform</h3>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
              <li>
                <Link to="/verify" className="hover:text-primary-foreground transition-colors">Verify a Job</Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-primary-foreground transition-colors">How It Works</Link>
              </li>
              <li>
                <Link to="/verify" className="hover:text-primary-foreground transition-colors">Report a Scam</Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
              <li>
                <Link to="/about" className="hover:text-primary-foreground transition-colors">About Us</Link>
              </li>
              <li>
                <a href="#" className="hover:text-primary-foreground transition-colors">Contact Support</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-foreground transition-colors">Terms of Service</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-foreground transition-colors">Privacy Policy</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-primary-foreground/20">
        <div className="container py-6 text-center text-sm text-primary-foreground/60">
          © 2026 JobVerify NG. All rights reserved. Made with ❤️ in Nigeria.
        </div>
      </div>
    </footer>
  );
}
