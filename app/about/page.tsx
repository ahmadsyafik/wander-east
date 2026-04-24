"use client";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { MapPin, Users, Star, Heart } from "lucide-react";

const serifFont = { fontFamily: "'DM Serif Display', Georgia, serif" };

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar isLoggedIn={false} />

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-card to-background">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6" style={serifFont}>
            About <span className="text-primary">Wander East</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Curating the untouched, the mysterious, and the extraordinary destinations 
            of East Java through a digital lens.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6" style={serifFont}>Our Mission</h2>
              <p className="text-muted-foreground mb-4">
                Wander East is dedicated to showcasing the hidden gems and natural 
                wonders of East Java, Indonesia. We believe that every corner of this 
                volcanic paradise holds a story waiting to be discovered.
              </p>
              <p className="text-muted-foreground mb-4">
                Our platform connects explorers with authentic local experiences, 
                from the majestic Bromo-Tengger-Semeru National Park to the serene 
                beaches of Banyuwangi, and the rich culinary heritage found in every city.
              </p>
              <p className="text-muted-foreground">
                Through gamification and community engagement, we encourage sustainable 
                tourism that benefits local communities while preserving the natural 
                beauty of East Java for generations to come.
              </p>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=600&q=80"
                alt="East Java Landscape"
                className="rounded-2xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-background rounded-xl p-6 text-center border border-border">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <p className="text-3xl font-bold mb-2">200+</p>
              <p className="text-muted-foreground">Destinations</p>
            </div>
            <div className="bg-background rounded-xl p-6 text-center border border-border">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <p className="text-3xl font-bold mb-2">10K+</p>
              <p className="text-muted-foreground">Explorers</p>
            </div>
            <div className="bg-background rounded-xl p-6 text-center border border-border">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <p className="text-3xl font-bold mb-2">50K+</p>
              <p className="text-muted-foreground">Reviews</p>
            </div>
            <div className="bg-background rounded-xl p-6 text-center border border-border">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <p className="text-3xl font-bold mb-2">15</p>
              <p className="text-muted-foreground">Cities Covered</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12" style={serifFont}>
            Our Team
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center text-3xl text-primary-foreground font-bold">
                A
              </div>
              <h3 className="font-semibold text-lg">Ahmad Rizky</h3>
              <p className="text-muted-foreground text-sm">Founder & CEO</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center text-3xl text-primary-foreground font-bold">
                S
              </div>
              <h3 className="font-semibold text-lg">Sari Dewi</h3>
              <p className="text-muted-foreground text-sm">Head of Content</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center text-3xl text-primary-foreground font-bold">
                B
              </div>
              <h3 className="font-semibold text-lg">Budi Santoso</h3>
              <p className="text-muted-foreground text-sm">Lead Developer</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
