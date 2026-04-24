import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/landing/hero-section";
import { RegionalHubs } from "@/components/landing/regional-hubs";
import { TrendingExpeditions } from "@/components/landing/trending-expeditions";
import { GamificationSection } from "@/components/landing/gamification-section";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
      <RegionalHubs />
      <TrendingExpeditions />
      <GamificationSection />
      <Footer />
    </main>
  );
}
