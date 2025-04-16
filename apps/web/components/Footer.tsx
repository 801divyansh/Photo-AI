import Link from "next/link";
import { Button } from "./ui/button";
import { FaFacebook, FaGithub, FaInstagram, FaLinkedin, FaTelegram, FaTwitter } from "react-icons/fa";

export function Footer() {
  return (
    <footer className="w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-screen-xl px-4 pb-8 pt-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-3">
          {/* Brand Section */}
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold font-mono text-xl">Photo AI</span>
            </div>

            <p className="mt-4 max-w-sm text-muted-foreground">
              Transform your photos with AI-powered editing tools. Create
              stunning visuals with just a few clicks.
            </p>

            <div className="mt-6 flex gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link
                  href="https://x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaTwitter className="h-5 w-5" />
                  <span className="sr-only">Twitter</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaGithub className="h-5 w-5" />
                  <span className="sr-only">GitHub</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaInstagram className="h-5 w-5" />
                  <span className="sr-only">Instagram</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaLinkedin className="h-5 w-5" />
                  <span className="sr-only">LinkedIn</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaFacebook className="h-5 w-5" />
                  <span className="sr-only">Facebook</span>
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 lg:col-span-2">
            <div className="space-y-4">
              <p className="font-medium">Company</p>
              <nav className="flex flex-col space-y-2">
                <Link
                  href="/"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  About
                </Link>
                <Link
                  href="/"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Pricing
                </Link>
                <Link
                  href="/"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Blog
                </Link>
                <Link
                  href="/"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Careers
                </Link>
              </nav>
            </div>

            <div className="space-y-4">
              <p className="font-medium">Help</p>
              <nav className="flex flex-col space-y-2">
                <Link
                  href="/"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  FAQ
                </Link>
                <Link
                  href="/"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Contact
                </Link>
                <Link
                  href="/"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Privacy
                </Link>
                <Link
                  href="/"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Terms
                </Link>
              </nav>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} PhotoAI. All rights reserved.
            </p>

            <div className="flex gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link
                  href="/"
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Privacy Policy
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link
                  href="/"
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Terms of Service
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
