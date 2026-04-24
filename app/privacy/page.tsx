"use client";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const serifFont = { fontFamily: "'DM Serif Display', Georgia, serif" };

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar isLoggedIn={false} />

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-card to-background">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6" style={serifFont}>
            Privacy <span className="text-primary">Policy</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Last updated: January 1, 2024
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto prose prose-invert">
            <div className="bg-card rounded-2xl p-8 border border-border space-y-8">
              <div>
                <h2 className="text-xl font-bold mb-4" style={serifFont}>
                  1. Information We Collect
                </h2>
                <p className="text-muted-foreground mb-4">
                  We collect information you provide directly to us, such as when you 
                  create an account, submit a review, upload photos, or contact us for support.
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Account information (name, email, password)</li>
                  <li>Profile information (avatar, bio, preferences)</li>
                  <li>Content you submit (reviews, photos, ratings)</li>
                  <li>Location data (when using map features)</li>
                  <li>Device and usage information</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-4" style={serifFont}>
                  2. How We Use Your Information
                </h2>
                <p className="text-muted-foreground mb-4">
                  We use the information we collect to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process your account registration and manage your profile</li>
                  <li>Display your reviews and contributions to other users</li>
                  <li>Send you notifications about your account or activity</li>
                  <li>Respond to your comments, questions, and requests</li>
                  <li>Monitor and analyze trends, usage, and activities</li>
                  <li>Detect, investigate, and prevent fraudulent transactions</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-4" style={serifFont}>
                  3. Information Sharing
                </h2>
                <p className="text-muted-foreground mb-4">
                  We do not sell, trade, or rent your personal information to third parties. 
                  We may share your information in the following circumstances:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>With your consent or at your direction</li>
                  <li>With service providers who assist in our operations</li>
                  <li>To comply with legal obligations</li>
                  <li>To protect our rights, privacy, safety, or property</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-4" style={serifFont}>
                  4. Data Security
                </h2>
                <p className="text-muted-foreground">
                  We implement appropriate technical and organizational measures to protect 
                  your personal information against unauthorized access, alteration, disclosure, 
                  or destruction. However, no method of transmission over the Internet is 
                  100% secure, and we cannot guarantee absolute security.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-4" style={serifFont}>
                  5. Your Rights
                </h2>
                <p className="text-muted-foreground mb-4">
                  You have the right to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Access and receive a copy of your personal data</li>
                  <li>Rectify or update your personal information</li>
                  <li>Delete your account and associated data</li>
                  <li>Object to or restrict processing of your data</li>
                  <li>Withdraw consent at any time</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-4" style={serifFont}>
                  6. Cookies
                </h2>
                <p className="text-muted-foreground">
                  We use cookies and similar technologies to collect information about your 
                  browsing activities and to distinguish you from other users. This helps us 
                  provide you with a better experience and allows us to improve our services.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-4" style={serifFont}>
                  7. Contact Us
                </h2>
                <p className="text-muted-foreground">
                  If you have any questions about this Privacy Policy, please contact us at:
                </p>
                <p className="text-primary mt-2">privacy@wandereast.com</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
