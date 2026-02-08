import { useNavigate, useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut, userRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Hide public links (Home/How It Works/About) when user is inside app pages
  const isAppRoute =
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/admin");

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const navLinkClass =
    "text-sm font-medium text-muted-foreground hover:text-primary transition-colors";
  const activeNavClass = "text-primary font-semibold";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">
            Job<span className="text-primary">Verify</span> NG
          </span>
        </NavLink>

        {/* Desktop Navigation (ONLY show on public pages) */}
        {!isAppRoute && (
          <nav className="hidden md:flex items-center gap-8">
            <NavLink to="/" end className={navLinkClass} activeClassName={activeNavClass}>
              Home
            </NavLink>
            <NavLink to="/how-it-works" className={navLinkClass} activeClassName={activeNavClass}>
              How It Works
            </NavLink>
            <NavLink to="/about" className={navLinkClass} activeClassName={activeNavClass}>
              About
            </NavLink>
          </nav>
        )}

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <NavLink to={userRole === "admin" ? "/admin" : "/dashboard"}>
                <Button variant="ghost">Dashboard</Button>
              </NavLink>
              <Button variant="outline" onClick={handleSignOut}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <NavLink to="/login">
                <Button variant="ghost">Login</Button>
              </NavLink>
              <NavLink to="/signup">
                <Button>Get Started</Button>
              </NavLink>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="container py-4 flex flex-col gap-4">
            {/* Mobile public links (ONLY show on public pages) */}
            {!isAppRoute && (
              <>
                <NavLink
                  to="/"
                  end
                  className={navLinkClass}
                  activeClassName={activeNavClass}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </NavLink>
                <NavLink
                  to="/how-it-works"
                  className={navLinkClass}
                  activeClassName={activeNavClass}
                  onClick={() => setIsMenuOpen(false)}
                >
                  How It Works
                </NavLink>
                <NavLink
                  to="/about"
                  className={navLinkClass}
                  activeClassName={activeNavClass}
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </NavLink>
              </>
            )}

            <div className="pt-4 border-t border-border flex flex-col gap-2">
              {user ? (
                <>
                  <NavLink
                    to={userRole === "admin" ? "/admin" : "/dashboard"}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Button variant="ghost" className="w-full">
                      Dashboard
                    </Button>
                  </NavLink>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <NavLink to="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full">
                      Login
                    </Button>
                  </NavLink>
                  <NavLink to="/signup" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full">Get Started</Button>
                  </NavLink>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
