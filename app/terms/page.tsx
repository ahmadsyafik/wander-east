"use client";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const serifFont = { fontFamily: "'DM Serif Display', Georgia, serif" };

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar isLoggedIn={false} />

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-card to-background">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6" style={serifFont}>
            Terms of <span className="text-primary">Service</span>
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
                  1. Acceptance of Terms
                </h2>
                <p className="text-muted-foreground">
                  By accessing or using the Wander East platform, you agree to be bound by 
                  these Terms of Service and all applicable laws and regulations. If you do 
                  not agree with any of these terms, you are prohibited from using or 
                  accessing this platform.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-4" style={serifFont}>
                  2. User Accounts
                </h2>
                <p className="text-muted-foreground mb-4">
                  When you create an account with us, you must provide accurate, complete, 
                  and current information. You are responsible for:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Maintaining the confidentiality of your account credentials</li>
                  <li>All activities that occur under your account</li>
                  <li>Notifying us immediately of any unauthorized use</li>
                  <li>Ensuring your account information is always up to date</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-4" style={serifFont}>
                  3. User Content
                </h2>
                <p className="text-muted-foreground mb-4">
                  You retain ownership of content you submit to Wander East. By posting 
                  content, you grant us a non-exclusive, worldwide, royalty-free license to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Use, reproduce, modify, and distribute your content</li>
                  <li>Display your content on the platform and in marketing materials</li>
                  <li>Create derivative works based on your content</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  You are solely responsible for the content you post and must ensure it 
                  does not violate any laws or the rights of others.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-4" style={serifFont}>
                  4. Prohibited Conduct
                </h2>
                <p className="text-muted-foreground mb-4">
                  You agree not to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Post false, misleading, or fraudulent content</li>
                  <li>Harass, abuse, or harm other users</li>
                  <li>Spam or post unauthorized commercial content</li>
                  <li>Impersonate others or misrepresent your affiliation</li>
                  <li>Attempt to access other users accounts or data</li>
                  <li>Interfere with the platforms operation or security</li>
                  <li>Violate any applicable laws or regulations</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-4" style={serifFont}>
                  5. Gamification & Rewards
                </h2>
                <p className="text-muted-foreground">
                  Our platform includes gamification features such as XP, levels, and badges. 
                  These features are for entertainment purposes only and have no monetary value. 
                  We reserve the right to modify, suspend, or discontinue any gamification 
                  features at any time without notice.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-4" style={serifFont}>
                  6. Third-Party Links
                </h2>
                <p className="text-muted-foreground">
                  Our platform may contain links to third-party websites or services that are 
                  not owned or controlled by Wander East. We have no control over, and assume 
                  no responsibility for, the content, privacy policies, or practices of any 
                  third-party websites or services.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-4" style={serifFont}>
                  7. Disclaimer of Warranties
                </h2>
                <p className="text-muted-foreground">
                  The platform is provided on an as is and as available basis. We make no 
                  warranties, expressed or implied, regarding the platforms operation, 
                  reliability, or availability. User-submitted content may not be accurate, 
                  and you should independently verify information before making travel decisions.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-4" style={serifFont}>
                  8. Limitation of Liability
                </h2>
                <p className="text-muted-foreground">
                  To the fullest extent permitted by law, Wander East shall not be liable for 
                  any indirect, incidental, special, consequential, or punitive damages arising 
                  out of or related to your use of the platform.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-4" style={serifFont}>
                  9. Termination
                </h2>
                <p className="text-muted-foreground">
                  We may terminate or suspend your account and access to the platform 
                  immediately, without prior notice or liability, for any reason, including 
                  breach of these Terms. Upon termination, your right to use the platform 
                  will cease immediately.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-4" style={serifFont}>
                  10. Changes to Terms
                </h2>
                <p className="text-muted-foreground">
                  We reserve the right to modify or replace these Terms at any time. If a 
                  revision is material, we will provide at least 30 days notice prior to any 
                  new terms taking effect. Your continued use of the platform after changes 
                  constitutes acceptance of the new terms.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-4" style={serifFont}>
                  11. Contact Information
                </h2>
                <p className="text-muted-foreground">
                  If you have any questions about these Terms, please contact us at:
                </p>
                <p className="text-primary mt-2">legal@wandereast.com</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
