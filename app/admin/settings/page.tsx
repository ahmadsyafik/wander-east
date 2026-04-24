"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Globe,
  Bell,
  Shield,
  Database,
  Mail,
  Save,
  RefreshCw,
} from "lucide-react";

const serifFont = { fontFamily: "'DM Serif Display', Georgia, serif" };

export default function AdminSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    siteName: "Wander East",
    siteDescription: "Curating the untouched, the mysterious, and the extraordinary destinations of East Java.",
    contactEmail: "hello@wandereast.com",
    supportEmail: "support@wandereast.com",
    enableRegistration: true,
    requireEmailVerification: true,
    enableReviews: true,
    autoApproveReviews: false,
    enableGamification: true,
    maintenanceMode: false,
    notifyNewUser: true,
    notifyNewReview: true,
    notifyFlaggedContent: true,
    dailyDigest: false,
  });

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    alert("Settings saved successfully! (This is a demo)");
  };

  const handleToggle = (key: keyof typeof settings) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={serifFont}>Settings</h1>
          <p className="text-muted-foreground">
            Configure platform settings and preferences.
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">General Settings</h2>
              <p className="text-sm text-muted-foreground">Basic site configuration</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Site Name</label>
              <Input
                value={settings.siteName}
                onChange={(e) =>
                  setSettings({ ...settings, siteName: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Site Description</label>
              <Textarea
                value={settings.siteDescription}
                onChange={(e) =>
                  setSettings({ ...settings, siteDescription: e.target.value })
                }
                rows={3}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Contact Email</label>
                <Input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) =>
                    setSettings({ ...settings, contactEmail: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Support Email</label>
                <Input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) =>
                    setSettings({ ...settings, supportEmail: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">Security & Access</h2>
              <p className="text-sm text-muted-foreground">User registration and authentication</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <p className="font-medium">Enable User Registration</p>
                <p className="text-sm text-muted-foreground">
                  Allow new users to create accounts
                </p>
              </div>
              <Switch
                checked={settings.enableRegistration}
                onCheckedChange={() => handleToggle("enableRegistration")}
              />
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <p className="font-medium">Require Email Verification</p>
                <p className="text-sm text-muted-foreground">
                  Users must verify email before full access
                </p>
              </div>
              <Switch
                checked={settings.requireEmailVerification}
                onCheckedChange={() => handleToggle("requireEmailVerification")}
              />
            </div>
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2">
                <p className="font-medium">Maintenance Mode</p>
                {settings.maintenanceMode && (
                  <Badge className="bg-yellow-500/20 text-yellow-400">Active</Badge>
                )}
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={() => handleToggle("maintenanceMode")}
              />
            </div>
          </div>
        </div>

        {/* Content Settings */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Database className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">Content Settings</h2>
              <p className="text-sm text-muted-foreground">Reviews and content moderation</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <p className="font-medium">Enable Reviews</p>
                <p className="text-sm text-muted-foreground">
                  Allow users to submit reviews for places
                </p>
              </div>
              <Switch
                checked={settings.enableReviews}
                onCheckedChange={() => handleToggle("enableReviews")}
              />
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <p className="font-medium">Auto-Approve Reviews</p>
                <p className="text-sm text-muted-foreground">
                  Automatically approve new reviews without moderation
                </p>
              </div>
              <Switch
                checked={settings.autoApproveReviews}
                onCheckedChange={() => handleToggle("autoApproveReviews")}
              />
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">Enable Gamification</p>
                <p className="text-sm text-muted-foreground">
                  XP, levels, badges, and leaderboard features
                </p>
              </div>
              <Switch
                checked={settings.enableGamification}
                onCheckedChange={() => handleToggle("enableGamification")}
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">Admin Notifications</h2>
              <p className="text-sm text-muted-foreground">Email notifications for admins</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <p className="font-medium">New User Registration</p>
                <p className="text-sm text-muted-foreground">
                  Get notified when a new user signs up
                </p>
              </div>
              <Switch
                checked={settings.notifyNewUser}
                onCheckedChange={() => handleToggle("notifyNewUser")}
              />
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <p className="font-medium">New Review Submitted</p>
                <p className="text-sm text-muted-foreground">
                  Get notified when a user submits a review
                </p>
              </div>
              <Switch
                checked={settings.notifyNewReview}
                onCheckedChange={() => handleToggle("notifyNewReview")}
              />
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <p className="font-medium">Flagged Content Alert</p>
                <p className="text-sm text-muted-foreground">
                  Get notified when content is flagged for review
                </p>
              </div>
              <Switch
                checked={settings.notifyFlaggedContent}
                onCheckedChange={() => handleToggle("notifyFlaggedContent")}
              />
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">Daily Digest</p>
                <p className="text-sm text-muted-foreground">
                  Receive a daily summary of platform activity
                </p>
              </div>
              <Switch
                checked={settings.dailyDigest}
                onCheckedChange={() => handleToggle("dailyDigest")}
              />
            </div>
          </div>
        </div>

        {/* Email Configuration */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">Email Configuration</h2>
              <p className="text-sm text-muted-foreground">SMTP settings for sending emails</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">SMTP Host</label>
              <Input placeholder="smtp.example.com" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">SMTP Port</label>
              <Input placeholder="587" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">SMTP Username</label>
              <Input placeholder="username" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">SMTP Password</label>
              <Input type="password" placeholder="********" />
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <Button variant="outline" size="sm">
              Test Connection
            </Button>
            <Button variant="outline" size="sm">
              Send Test Email
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
