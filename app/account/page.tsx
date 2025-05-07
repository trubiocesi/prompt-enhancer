"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  User as UserIcon,
  CreditCard,
  LogOut,
} from "lucide-react";
import { supabaseClient } from "../../lib/supabaseClient";

export default function AccountPage() {
  const handleGoHome = () => router.push("/");
  const router = useRouter();
  const params = useSearchParams();
  const initial = params.get("tab") === "subscription" ? "subscription" : "profile";
  const [tab, setTab] = useState<"profile" | "subscription">(initial);

  useEffect(() => {
    router.replace(`/account?tab=${tab}`, { scroll: false });
  }, [tab, router]);

  return (
    <>
      {/* Page Header */}
      <header className="px-6 py-8 bg-light-bg dark:bg-[#12121A] border-b border-gray-200 dark:border-white/10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
        <button
            onClick={handleGoHome}
            className="fixed top-4 left-4 z-50
                        flex items-center justify-center
                        px-4 py-2 rounded-full font-bold text-xl
                        bg-white text-gray-900 border border-gray-300 shadow
                        dark:bg-[#1E1E2A] dark:text-white dark:border-white/20
                        hover:scale-105 hover:shadow-md transition"
            title="Back to Home"
            >
            <span className="text-white dark:text-white">P</span>
            <span className="text-accent ml-1">R</span>
            </button>
          <div>
            <h1 className="text-3xl font-extrabold text-light-text dark:text-gray-100">
              My Account
            </h1>
            <p className="mt-1 text-light-text/70 dark:text-gray-400">
              Manage your profile and subscription settings.
            </p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="text-sm font-semibold underline text-light-text hover:text-light-text-dark dark:text-white"
          >
            ← Back to Home
          </button>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-128px)] bg-light-bg dark:bg-[#12121A]">
        {/* Sidebar */}
        <aside className="w-1/5 bg-white dark:bg-[#1E1E2A] border-r border-gray-200 dark:border-white/10 p-6 hidden md:block">
          <UserProfileNav tab={tab} setTab={setTab} />
        </aside>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          {tab === "profile" ? <ProfileDashboard /> : <SubscriptionDashboard />}
        </main>
      </div>
    </>
  );
}

function UserProfileNav({
  tab,
  setTab,
}: {
  tab: "profile" | "subscription";
  setTab: (t: "profile" | "subscription") => void;
}) {
  return (
    <nav className="space-y-8">
      <div className="text-center">
        <div className="mx-auto w-20 h-20 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
          <UserIcon className="h-10 w-10 text-gray-100" />
        </div>
        <p className="mt-2 font-semibold text-light-text dark:text-gray-100">
          Your Name
        </p>
      </div>
      {[
        { key: "profile", label: "Profile", icon: UserIcon },
        { key: "subscription", label: "Subscription", icon: CreditCard },
      ].map(({ key, label, icon: Icon }) => {
        const active = tab === key;
        return (
          <button
            key={key}
            onClick={() => setTab(key as "profile" | "subscription")}
            className={`
              flex items-center w-full px-4 py-2 rounded-lg text-sm font-medium transition
              ${active
                ? "bg-gray-100 text-gray-900 dark:bg-[#7F1D1D] dark:text-white"
                : "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"}
            `}
          >
            <Icon className="h-5 w-5 mr-3" />
            {label}
          </button>
        );
      })}
      <div className="border-t border-gray-200 dark:border-white/10 pt-4">
        <button
          onClick={() => supabaseClient.auth.signOut()}
          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 rounded-lg transition"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sign Out
        </button>
      </div>
    </nav>
  );
}

type UserType = {
    email?: string;
    user_metadata?: {
      avatar_url?: string;
      full_name?: string;
      display_name?: string;
      subscription_tier?: string;
      credits_remaining?: number;
      credits_limit?: number;
    };
  };

function ProfileDashboard() {
  const [sessionUser, setSessionUser] = useState<UserType | null>(null);


  // persisted display
  const [savedName, setSavedName] = useState("");
  const [savedDisplay, setSavedDisplay] = useState("");
  const [savedEmail, setSavedEmail] = useState("");

  // inputs
  const [nameInput, setNameInput] = useState("");
  const [displayInput, setDisplayInput] = useState("");
  const [emailInput, setEmailInput] = useState("");

  // password editing
  const [editingPwd, setEditingPwd] = useState(false);
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");

  // toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  function showToast(message: string, type: "success" | "error" = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  // mock tier
  const tier = "Free";

  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data }) => {
      setSessionUser(data.session?.user ?? null);
    });
    // load saved profile
    const lsName = localStorage.getItem("profile_full_name");
    const lsDisplay = localStorage.getItem("profile_display_name");
    const lsEmail = localStorage.getItem("profile_email");
    if (lsName) setSavedName(lsName);
    if (lsDisplay) setSavedDisplay(lsDisplay);
    if (lsEmail) setSavedEmail(lsEmail);
  }, []);

  function handleSave() {
    if (!nameInput && !displayInput && !emailInput) {
      showToast("Nothing to save—please change at least one field.", "error");
      return;
    }
    if (nameInput) {
      localStorage.setItem("profile_full_name", nameInput);
      setSavedName(nameInput);
      setNameInput("");
    }
    if (displayInput) {
      localStorage.setItem("profile_display_name", displayInput);
      setSavedDisplay(displayInput);
      setDisplayInput("");
    }
    if (emailInput) {
      localStorage.setItem("profile_email", emailInput);
      setSavedEmail(emailInput);
      setEmailInput("");
    }
    showToast("Profile updated!", "success");
  }

  async function savePwd() {
    if (newPwd !== confirmPwd) {
      showToast("New passwords do not match", "error");
      return;
    }
    const { error } = await supabaseClient.auth.updateUser({ password: newPwd });
    if (error) {
      showToast("Failed to update password: " + error.message, "error");
    } else {
      showToast("Password updated successfully!", "success");
      cancelPwd();
    }
  }

  function cancelPwd() {
    setEditingPwd(false);
    setCurrentPwd("");
    setNewPwd("");
    setConfirmPwd("");
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Avatar & Profile Info */}
        <Card>
          <CardHeader title="Profile" />
          <div className="flex flex-col items-center space-y-4">
            {sessionUser?.user_metadata?.avatar_url ? (
              <Image
                src={sessionUser.user_metadata.avatar_url}
                alt="Avatar"
                width={96}
                height={96}
                className="rounded-full"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                <UserIcon className="h-12 w-12 text-gray-100" />
              </div>
            )}

            <button className="mt-2 px-4 py-2 bg-gray-700 text-white hover:bg-gray-800 rounded-md transition">
              Change Avatar
            </button>

            {/* Displayed profile */}
            <div className="text-center space-y-1">
              <p className="text-lg font-semibold text-light-text dark:text-gray-100">
                {savedName || "Your Name"}
              </p>
              <p className="text-sm text-light-text/70 dark:text-gray-400">
                {savedDisplay || "Display Name"}
              </p>
              <p className="text-sm text-light-text/70 dark:text-gray-400">
                {savedEmail || "you@example.com"}
              </p>
              <span
                className="
                  px-3 py-1 text-xs font-semibold rounded-full
                  bg-gray-200 text-gray-800
                  dark:bg-gray-700 dark:text-gray-100
                "
              >
                {tier}
              </span>
            </div>
          </div>
        </Card>

        {/* Edit Profile Inputs */}
        <Card>
          <CardHeader title="Edit Profile Details" />
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-light-text dark:text-gray-200">
                Full Name
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Enter full name"
                className="mt-1 w-full rounded-md bg-light-bg border border-light-border p-2 text-light-text focus:ring-accent dark:bg-black/40 dark:border-white/20 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-light-text dark:text-gray-200">
                Display Name
              </label>
              <input
                type="text"
                value={displayInput}
                onChange={(e) => setDisplayInput(e.target.value)}
                placeholder="Enter display name"
                className="mt-1 w-full rounded-md bg-light-bg border border-light-border p-2 text-light-text focus:ring-accent dark:bg-black/40 dark:border-white/20 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-light-text dark:text-gray-200">
                Email
              </label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Enter email"
                className="mt-1 w-full rounded-md bg-light-bg border border-light-border p-2 text-light-text focus:ring-accent dark:bg-black/40 dark:border-white/20 dark:text-white"
              />
            </div>
          </div>
          <CardFooter>
            <button
              onClick={handleSave}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition"
            >
              Save Changes
            </button>
          </CardFooter>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader title="Security" />
          {!editingPwd ? (
            <>
              <p className="text-light-text dark:text-gray-100 mb-4">
                <strong>Password:</strong>
              </p>
              <button
                onClick={() => setEditingPwd(true)}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition"
              >
                Change Password
              </button>
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-light-text dark:text-gray-200">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPwd}
                  onChange={(e) => setCurrentPwd(e.target.value)}
                  placeholder="Enter current password"
                  autoComplete="current-password"
                  className="mt-1 w-full rounded-md bg-light-bg border border-light-border p-2 text-light-text focus:ring-accent dark:bg-black/40 dark:border-white/20 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-light-text dark:text-gray-200">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  placeholder="Enter new password"
                  className="mt-1 w-full rounded-md bg-light-bg border border-light-border p-2 text-light-text focus:ring-accent dark:bg-black/40 dark:border-white/20 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-light-text dark:text-gray-200">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  placeholder="Confirm new password"
                  className="mt-1 w-full rounded-md bg-light-bg border border-light-border p-2 text-light-text focus:ring-accent dark:bg-black/40 dark:border-white/20 dark:text-white"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={cancelPwd}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={savePwd}
                  className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition"
                >
                  Save Password
                </button>
              </div>
            </div>
          )}
        </Card>

        {/* Usage */}
        <Card>
          <CardHeader title="Usage" />
          <div className="space-y-4">
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div className="bg-accent h-full" style={{ width: "30%" }} />
            </div>
            <p className="text-sm text-light-text dark:text-gray-400">
              You’ve used 3 of 10 prompts this month
            </p>
            <button className="mt-4 px-4 py-2 bg-gray-700 text-white hover:bg-gray-800 rounded-md transition">
              Manage Plan
            </button>
          </div>
        </Card>
      </div>
    </>
  );
}

function SubscriptionDashboard() {
  return <div>{/* your subscription UI here */}</div>;
}

// ——— Reusable Components ———

function Card({ children }: React.PropsWithChildren) {
  return (
    <div className="bg-white dark:bg-[#1E1E2A] rounded-xl shadow p-6 space-y-4">
      {children}
    </div>
  );
}

function CardHeader({ title }: { title: string }) {
  return (
    <h3 className="text-lg font-medium text-light-text dark:text-gray-100 mb-2">
      {title}
    </h3>
  );
}

function CardFooter({ children }: React.PropsWithChildren) {
  return <div className="pt-4 border-t border-gray-200 dark:border-white/10">{children}</div>;
}

// ——— Toast Component ———

function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) {
  return (
    <div
      className={`
        fixed top-6 right-6 z-50 max-w-xs px-4 py-2 rounded shadow-lg
        ${type === "success"
          ? "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100"
          : "bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100"
        }
      `}
    >
      <div className="flex justify-between items-center">
        <span className="text-sm">{message}</span>
        <button onClick={onClose} className="ml-4 font-bold">&times;</button>
      </div>
    </div>
  );
}
