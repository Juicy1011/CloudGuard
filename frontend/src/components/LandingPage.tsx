"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Shield,
  Server,
  Cpu,
  Terminal,
  Zap,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Activity,
  ChevronDown,
  ArrowRight,
  Radio,
  Layers,
  Sun,
  Moon,
  Key,
  FileText,
  Globe
} from "lucide-react";
import { Typewriter } from "@/components/ui/Typewriter";
import { CloudPipelineGraphic, CloudVectorTopologyGraphic } from "@/components/LandingPageGraphics";

interface LandingPageProps {
  onNavigateToLogin?: () => void;
}

export default function LandingPage({ onNavigateToLogin }: LandingPageProps) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const isLight = theme === "light";

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const problems = [
    {
      title: "Agent Overhead & Resource Inflation",
      description: "Traditional monitoring requires installing heavy background agents on every server, consuming valuable CPU cycles, memory buffers, and disk space.",
      icon: Cpu,
    },
    {
      title: "Expanded Attack Surface",
      description: "Installing third-party binaries with root permissions on target servers introduces unexpected vulnerability vectors and compliance audit hurdles.",
      icon: AlertTriangle,
    },
    {
      title: "Complex Installation Pipelines",
      description: "Managing daemon packages, cross-distro package repositories, and automated updates across hybrid cloud fleets creates ongoing DevOps fatigue.",
      icon: Terminal,
    },
    {
      title: "Opaque Vendor Lock-In",
      description: "SaaS monitoring platforms collect proprietary telemetry data while imposing unpredictable usage billing as host counts scale.",
      icon: Lock,
    },
  ];

  const solutions = [
    {
      title: "100% Agentless Architecture",
      description: "Leverages standard Linux SSH and ICMP protocols already present in system kernels. Zero software installation required on target servers.",
      icon: Shield,
    },
    {
      title: "Instant Microservice Discovery",
      description: "Automatically inventories running Docker containers, mapping runtime statuses, container IDs, CPU usage, and network ports over SSH.",
      icon: Layers,
    },
    {
      title: "Zero SaaS Dependencies",
      description: "Self-hosted solution with full PostgreSQL database ownership. Telemetry and host credentials remain strictly within your infrastructure.",
      icon: Server,
    },
    {
      title: "Real-Time SMTP Incident Alerting",
      description: "Background worker engine monitors server availability and container states every 5 seconds, dispatching instant email alerts upon disruption.",
      icon: Zap,
    },
  ];

  const workflowSteps = [
    {
      step: "01",
      title: "Host Enrollment",
      description: "Register server IP or hostname with SSH credentials via the Access Control Vault.",
    },
    {
      step: "02",
      title: "Credential Encryption",
      description: "Credentials are encrypted at rest using AES-128 Fernet tokens before database storage.",
    },
    {
      step: "03",
      title: "Asynchronous Telemetry",
      description: "Background worker executes ICMP pings and non-blocking SSH commands for live metrics.",
    },
    {
      step: "04",
      title: "Triage & Alert Dispatch",
      description: "Health metrics are processed, dashboard cards update, and SMTP alerts fire on outage.",
    },
  ];

  const securityFeatures = [
    {
      title: "AES-128 Fernet Encryption",
      description: "Passwords and SSH private keys are tokenized using symmetric encryption before persisting to PostgreSQL.",
      icon: Key,
    },
    {
      title: "PBKDF2 Hashing & JWT Auth",
      description: "Operator passphrases are hashed using PBKDF2-SHA256, and stateful API routes require signed Bearer JWT tokens.",
      icon: Lock,
    },
    {
      title: "IP Address Security Masking",
      description: "Host IP addresses are blurred by default across presentation views to protect production network layouts.",
      icon: Globe,
    },
    {
      title: "Trust-On-First-Use (TOFU)",
      description: "Paramiko SSH client handles host key validation securely without requiring pre-shared public key databases.",
      icon: FileText,
    },
  ];

  const faqs = [
    {
      question: "How does CloudGuard collect metrics without installing agents?",
      answer: "CloudGuard uses standard ICMP Echo Requests (pings) for latency/availability testing, and connects over SSH using Paramiko to execute lightweight shell scripts (such as 'docker stats' and system statistics commands). The host requires no extra daemons.",
    },
    {
      question: "Are SSH passwords and private keys stored securely?",
      answer: "Yes. All stored credentials (passwords and private keys) are encrypted using AES-128 Fernet token encryption before being written to the PostgreSQL database. They are only decrypted in memory during active SSH execution cycles.",
    },
    {
      question: "What happens if a container or host server goes offline?",
      answer: "The background monitoring worker polls all enrolled host nodes every 5 seconds. If a host ping fails or a Docker container enters an Exited status, the system triggers an incident alert and sends emails via SMTP to all registered operator addresses.",
    },
    {
      question: "Can I use CloudGuard in a isolated local network or staging environment?",
      answer: "Yes. CloudGuard includes a built-in Demo Mode toggle for isolated staging or presentation environments. When Demo Mode is enabled, the system generates deterministic microservice telemetry and supports full Chaos Mode testing without needing live external hosts.",
    },
  ];

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${
      isLight ? "bg-slate-50 text-slate-900" : "bg-slate-950 text-slate-100"
    }`}>
      <header className={`sticky top-0 z-40 border-b backdrop-blur-xl transition-colors ${
        isLight ? "bg-white/80 border-slate-200" : "bg-slate-950/80 border-slate-800/80"
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-md shadow-blue-500/20">
              CG
            </div>
            <span className={`font-bold text-2xl tracking-tight bg-gradient-to-r ${
              isLight ? "from-slate-900 via-blue-900 to-indigo-900" : "from-white via-slate-100 to-blue-200"
            } bg-clip-text text-transparent`}>
              CloudGuard
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl border transition-all ${
                isLight
                  ? "border-slate-200 text-slate-600 hover:bg-slate-100"
                  : "border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-white"
              }`}
              title="Toggle theme"
            >
              {isLight ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <Link
              href="/login"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-blue-500/25"
            >
              Launch Console
            </Link>
          </div>
        </div>
      </header>

      <section className="relative pt-20 pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold mb-8 shadow-xs"
          >
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              isLight ? "bg-blue-100 text-blue-700" : "bg-blue-500/20 text-blue-400"
            }`}>
              Agentless
            </span>
            <span className={isLight ? "text-slate-600" : "text-slate-300"}>
              Agentless Cloud Monitoring & Fleet Management
              {/* <Typewriter
                text={[
                  "Agentless Cloud Monitoring & Fleet Management",
                  "SSH & ICMP Telemetry Without Daemons",
                  "Instant Microservice Container Discovery",
                  "Real-Time SMTP Disruption Alerting"
                ]}
                speed={40}
                waitTime={2500}
                className="font-medium"
              /> */}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight ${
              isLight ? "text-slate-900" : "text-white"
            }`}
          >
            Unified Cloud Observability Without Target Server Agents
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`mt-6 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed ${
              isLight ? "text-slate-600" : "text-slate-400"
            }`}
          >
            Monitor server availability, ICMP latency, CPU and memory utilization, and Docker microservice statuses using native SSH and ICMP protocols.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            <Link
              href="/login"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-base rounded-2xl transition-all shadow-lg shadow-blue-500/25 flex items-center gap-3"
            >
              Get Started Free <ArrowRight size={18} />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-16 max-w-5xl mx-auto border rounded-3xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden"
          >
            <div className={`flex items-center justify-between pb-4 mb-6 border-b ${
              isLight ? "border-slate-200" : "border-slate-800"
            }`}>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className={`text-xs font-mono ml-2 ${isLight ? "text-slate-400" : "text-slate-500"}`}>
                  cloudguard-dashboard.internal
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-500 font-mono font-semibold">
                <Radio size={14} className="animate-pulse" /> Live Telemetry
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className={`p-4 border rounded-2xl ${
                isLight ? "bg-white border-slate-200" : "bg-slate-900/80 border-slate-800"
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-sm">Skylab Production</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">Online</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>CPU Utilization</span>
                    <span className="font-mono text-emerald-400">14.2%</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: "14.2%" }} />
                  </div>
                  <div className="flex justify-between text-slate-400 pt-1">
                    <span>Microservices</span>
                    <span className="font-mono text-slate-200">5 Running</span>
                  </div>
                </div>
              </div>

              <div className={`p-4 border rounded-2xl ${
                isLight ? "bg-white border-slate-200" : "bg-slate-900/80 border-slate-800"
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-sm">Helios Database</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">Online</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Memory Allocation</span>
                    <span className="font-mono text-indigo-400">42.8%</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: "42.8%" }} />
                  </div>
                  <div className="flex justify-between text-slate-400 pt-1">
                    <span>Latency</span>
                    <span className="font-mono text-emerald-400">18.4 ms</span>
                  </div>
                </div>
              </div>

              <div className={`p-4 border rounded-2xl ${
                isLight ? "bg-white border-slate-200" : "bg-slate-900/80 border-slate-800"
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-sm">Zenith Analytics</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">Online</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>ICMP Ping</span>
                    <span className="font-mono text-emerald-400">22.1 ms</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-500 rounded-full" style={{ width: "22.1%" }} />
                  </div>
                  <div className="flex justify-between text-slate-400 pt-1">
                    <span>Alert Status</span>
                    <span className="font-mono text-emerald-400">0 Outages</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className={`py-20 border-t ${isLight ? "bg-white border-slate-200" : "bg-slate-900/40 border-slate-900"}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-rose-500 mb-3">
              The Agent Problem
            </h2>
            <h3 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
              isLight ? "text-slate-900" : "text-white"
            }`}>
              Why Traditional Monitoring Tools Fail Modern Teams
            </h3>
            <p className={`mt-4 text-base ${isLight ? "text-slate-600" : "text-slate-400"}`}>
              Installing proprietary daemons across hybrid cloud servers adds operational drag, security friction, and unpredictable software licensing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {problems.map((prob, idx) => (
              <div
                key={idx}
                className={`p-8 border rounded-3xl transition-all ${
                  isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950/60 border-slate-800/80"
                }`}
              >
                <div className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl w-fit mb-6">
                  <prob.icon size={24} />
                </div>
                <h4 className={`text-xl font-bold mb-3 ${isLight ? "text-slate-900" : "text-white"}`}>
                  {prob.title}
                </h4>
                <p className={`text-sm leading-relaxed ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                  {prob.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-3">
              The Solution
            </h2>
            <h3 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
              isLight ? "text-slate-900" : "text-white"
            }`}>
              How CloudGuard Delivers Agentless Observability
            </h3>
            <p className={`mt-4 text-base ${isLight ? "text-slate-600" : "text-slate-400"}`}>
              By using built-in system protocols, CloudGuard connects securely without requiring binary installations on your target hosts.
            </p>
          </div>

          <div className="mb-12">
            <CloudPipelineGraphic isLight={isLight} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {solutions.map((sol, idx) => (
              <div
                key={idx}
                className={`p-8 border rounded-3xl transition-all ${
                  isLight
                    ? "bg-white border-slate-200 shadow-sm"
                    : "bg-slate-900/60 border-slate-800/80 backdrop-blur-md"
                }`}
              >
                <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl w-fit mb-6">
                  <sol.icon size={24} />
                </div>
                <h4 className={`text-xl font-bold mb-3 ${isLight ? "text-slate-900" : "text-white"}`}>
                  {sol.title}
                </h4>
                <p className={`text-sm leading-relaxed ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                  {sol.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: How It Works */}
      <section className={`py-20 border-t ${isLight ? "bg-slate-100/50 border-slate-200" : "bg-slate-900/40 border-slate-900"}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-3">
              Architecture Workflow
            </h2>
            <h3 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
              isLight ? "text-slate-900" : "text-white"
            }`}>
              4 Simple Steps From Enrollment to Alerting
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflowSteps.map((step, idx) => (
              <div
                key={idx}
                className={`p-6 border rounded-2xl relative ${
                  isLight ? "bg-white border-slate-200 shadow-xs" : "bg-slate-950 border-slate-800"
                }`}
              >
                <span className="text-3xl font-extrabold font-mono text-blue-500/40 mb-4 block">
                  {step.step}
                </span>
                <h4 className={`text-lg font-bold mb-2 ${isLight ? "text-slate-900" : "text-white"}`}>
                  {step.title}
                </h4>
                <p className={`text-xs leading-relaxed ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <CloudVectorTopologyGraphic isLight={isLight} />
          </div>
        </div>
      </section>

      {/* Section 4: Security & Encryption */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-3">
              Enterprise Security
            </h2>
            <h3 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
              isLight ? "text-slate-900" : "text-white"
            }`}>
              Hardened Credential Encryption & Data Privacy
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {securityFeatures.map((sec, idx) => (
              <div
                key={idx}
                className={`p-8 border rounded-3xl flex items-start gap-5 ${
                  isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900/60 border-slate-800/80"
                }`}
              >
                <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl shrink-0">
                  <sec.icon size={24} />
                </div>
                <div>
                  <h4 className={`text-lg font-bold mb-2 ${isLight ? "text-slate-900" : "text-white"}`}>
                    {sec.title}
                  </h4>
                  <p className={`text-sm leading-relaxed ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                    {sec.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: Frequently Asked Questions */}
      <section className={`py-20 border-t ${isLight ? "bg-white border-slate-200" : "bg-slate-900/40 border-slate-900"}`}>
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-purple-500 mb-3">
              Got Questions?
            </h2>
            <h3 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
              isLight ? "text-slate-900" : "text-white"
            }`}>
              Frequently Asked Questions
            </h3>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className={`border rounded-2xl overflow-hidden transition-all ${
                    isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"
                  }`}
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-base"
                  >
                    <span className={isLight ? "text-slate-900" : "text-white"}>{faq.question}</span>
                    <ChevronDown size={18} className={`shrink-0 transition-transform ${isOpen ? "rotate-180 text-blue-500" : "text-slate-500"}`} />
                  </button>
                  {isOpen && (
                    <div className={`px-6 pb-6 text-sm leading-relaxed ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 6: Call to Action */}
      <section className="py-20 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className={`p-12 border rounded-3xl relative overflow-hidden shadow-2xl ${
            isLight
              ? "bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white border-blue-500"
              : "bg-gradient-to-tr from-blue-950/80 via-slate-900 to-indigo-950/80 border-slate-800"
          }`}>
            <h3 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-6">
              Ready for Agentless Cloud Observability?
            </h3>
            <p className="text-blue-100 max-w-2xl mx-auto text-base sm:text-lg mb-8 leading-relaxed">
              Launch the CloudGuard management console to enroll server hosts, view live microservice metrics, and configure instant alert vaults.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-blue-600 hover:bg-blue-50 active:scale-95 font-bold text-base rounded-2xl transition-all shadow-xl"
            >
              Launch Console Now <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-12 border-t text-center text-xs ${
        isLight ? "border-slate-200 text-slate-500" : "border-slate-900 text-slate-500"
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-semibold">
            <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xs text-white">
              CG
            </div>
            <span>CloudGuard Monitoring Engine</span>
          </div>
          <p>Agentless Cloud Monitoring & Microservice Management System</p>
        </div>
      </footer>
    </div>
  );
}
