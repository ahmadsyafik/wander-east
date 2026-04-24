"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const serifFont = { fontFamily: "'DM Serif Display', Georgia, serif" };

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=1920&q=80"
          alt="East Java Landscape"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
      </div>

      {/* Landing Navbar - Transparent */}
      <header className="absolute top-0 left-0 right-0 z-50">
        <nav className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-1">
              <span className="text-primary text-2xl" style={serifFont}>Wander</span>
              <span className="text-foreground text-2xl" style={serifFont}>East</span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-6">
              <Link href="/about" className="text-foreground/80 hover:text-foreground transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-foreground/80 hover:text-foreground transition-colors">
                Contact
              </Link>
              <Link href="/privacy" className="text-foreground/80 hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-foreground/80 hover:text-foreground transition-colors">
                Terms
              </Link>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild className="text-foreground">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Register</Link>
              </Button>
            </div>
          </div>
        </nav>
      </header>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <p className="text-primary font-medium mb-4 tracking-wider uppercase text-sm">
          Discover East Java
        </p>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-balance" style={serifFont}>
          Beyond the{" "}
          <span className="text-primary relative italic">
            Known Path
            <svg
              className="absolute -bottom-2 left-0 w-full"
              viewBox="0 0 200 8"
              fill="none"
            >
              <path
                d="M2 6C50 2 150 2 198 6"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                className="text-primary/50"
              />
            </svg>
          </span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-balance">
          Curating the untouched, the mysterious, and the extraordinary. Discover
          the soul of the volcanic east through a digital lens.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" asChild className="rounded-full px-8">
            <Link href="/explore">
              Start Exploring
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-xs text-muted-foreground uppercase tracking-widest">
            Scroll to Explore
          </span>
          <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center">
            <div className="w-1 h-2 bg-primary rounded-full mt-2 animate-bounce" />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 4s ease-in-out infinite;
          animation-delay: 1s;
        }
      `}</style>
    </section>
  );
}
