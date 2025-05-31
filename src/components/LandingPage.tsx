'use client';

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  Gift, HeartPulse, FileText, Zap, ShoppingBag, Star, Clock, 
  ArrowRight, Play, X 
} from "lucide-react";

/**
 * LandingPage.tsx  – public marketing page
 * --------------------------------------------------
 * Key update: TaskForPerks now operates a mandatory escrow flow for **all** perks.
 *  » Cash, vouchers & gift-cards are locked when the task is posted.
 *  » Physical items are collected by a verified courier partner and stored until release.
 *  » Funds/items are only released once the poster marks the task as complete or after mediation.
 *
 * 2025-05-31
 */

const fadeUp = { 
  hidden: { opacity: 0, y: 24 }, 
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } } 
};

const MotionSection = ({ children, className = "", id = "" }: { 
  children: React.ReactNode; 
  className?: string; 
  id?: string; 
}) => (
  <motion.section 
    className={className} 
    id={id} 
    initial="hidden" 
    whileInView="show" 
    viewport={{ once: true, margin: "-80px" }} 
    variants={fadeUp}
  >
    {children}
  </motion.section>
);

export default function LandingPage() {
  
  const [currentActivity, setCurrentActivity] = useState(0);
  const [tasksToday, setTasksToday] = useState(847);
  const [showVideo, setShowVideo] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  //------------------ Live banners & copy ------------------//
  const liveActivity: string[] = [
    "Sarah traded £40 Amazon card (escrow-held) for urgent document delivery",
    "Mike earned £25 PayPal (released on completion) for grocery pickup in Manchester", 
    "Emma got prescription delivered – £15 Uber Eats card released from escrow",
    "James earned AirPods after airport pickup (items stored with courier)",
    "Lucy traded old iPad (escrow courier) for tech emergency fix"
  ];

  const exchangeTypes = [
    { 
      icon: "💳", 
      title: "Digital Payments", 
      desc: "PayPal, bank transfers – locked in escrow instantly",
      highlight: true,
      successRate: "98%"
    },
    { 
      icon: "🎁", 
      title: "Gift Cards", 
      desc: "Amazon, Uber – codes released on completion",
      successRate: "94%"
    },
    { 
      icon: "📱", 
      title: "Tech & Gadgets", 
      desc: "Unused AirPods or accessories? We courier & hold until task done",
      successRate: "91%"
    },
    { 
      icon: "🚗", 
      title: "Services & Transport", 
      desc: "Trade rides or skills – perks remain in escrow until both sides approve",
      successRate: "87%"
    },
  ];

  const topScenarios = [
    {
      icon: Zap,
      title: "Tech Emergency",
      description: "Dead laptop before presentation?",
      perk: "£25 PayPal (escrow)",
      time: "Help in 15min"
    },
    {
      icon: FileText,
      title: "Document Rush",
      description: "Print, notarize, deliver by 5PM?",
      perk: "£35 Amazon voucher (escrow)",
      time: "Done in 45min"
    },
    {
      icon: HeartPulse,
      title: "Prescription Run",
      description: "Stuck at work, need meds?",
      perk: "£30 gift card (escrow)",
      time: "Delivered in 30min"
    },
    {
      icon: Gift,
      title: "Gift Crisis",
      description: "Forgot anniversary?",
      perk: "Your old AirPods (courier escrow)",
      time: "Wrapped in 1hr"
    },
    {
      icon: ShoppingBag,
      title: "Specific Items",
      description: "Need that exact thing?",
      perk: "£25-45 flexible (escrow)",
      time: "Got in 40min"
    }
  ];

  const testimonials = [
    { 
      quote: "Offered £25 PayPal for HDMI cable. Escrow made me feel safe. Had 4 offers in 90 seconds!", 
      name: "Ava Martinez",
      role: "Startup Founder",
      photo: "👩‍💼"
    },
    { 
      quote: "Posted at 2:47 pm, docs by 3:32 pm. Knowing the voucher was in escrow kept everyone honest.", 
      name: "Marcus Liu",
      role: "Remote Developer",
      photo: "👨‍💻"
    },
    { 
      quote: "My go-to for urgent stuff. Escrow + mediation means zero hassles.", 
      name: "Sarah Kim",
      role: "Consultant",
      photo: "👩‍💼"
    }
  ];

  const faqs = [
    { 
      q: "How quickly do tasks get claimed?", 
      a: "Digital-payment tasks: under 2 minutes. Gift cards: under 5 minutes. Average: 3.5 minutes." 
    },
    { 
      q: "What are your fees?", 
      a: "We charge a flat 5% only when a task completes successfully. Escrow, insurance & mediation are included. No monthly fees." 
    },
    { 
      q: "What if no one claims my task?", 
      a: "Rare (≈ 6% of tasks). Our AI will suggest a better perk or run a free 'Boost'. If still unclaimed, escrow is automatically released back to you." 
    },
    { 
      q: "How do I know helpers are trustworthy?", 
      a: "All helpers are ID-verified and background-checked. Your perk stays in escrow until you confirm completion, so helpers only get paid when they deliver." 
    },
    { 
      q: "Do you accept cash payments?", 
      a: "No. We only process traceable digital payments & gift cards in escrow. This protects both sides and allows instant refunds if needed." 
    },
    {
      q: "How does escrow work?",
      a: "When you post a task, your chosen perk (cash, crypto, gift-card code, or physical item via courier) is locked in our FCA-regulated escrow. Helpers see the reward but can't touch it. Once you mark the task complete, we release the perk instantly. If there's a dispute, our mediation team reviews evidence and either refunds you or releases the perk." 
    }
  ];

  // Rotating social proof ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentActivity((prev) => (prev + 1) % liveActivity.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [liveActivity.length]);

  // Live counter animation
  useEffect(() => {
    const interval = setInterval(() => {
      setTasksToday((prev) => prev + Math.floor(Math.random() * 3));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col bg-white text-slate-900">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 shadow-sm">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <Link href="/" className="font-bold text-xl hover:text-indigo-600 transition-colors">
            TaskForPerks
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-sm text-gray-600">
              <span className="text-green-600 font-semibold">{tasksToday}</span> tasks completed today
            </span>
            <Link 
              href="/login"
              className="bg-indigo-600 text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-indigo-700 transition-colors"
            >
              Start Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-600 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-6 pt-40 pb-20 relative">
          {/* Live activity ticker */}
          <motion.div 
            className="flex items-center justify-center gap-2 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className="flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <AnimatePresence mode="wait">
              <motion.span 
                key={currentActivity}
                className="text-sm text-green-100"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {liveActivity[currentActivity]}
              </motion.span>
            </AnimatePresence>
          </motion.div>

          <motion.h1 
            className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight text-center"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            Get Any Task Done<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
              In Under 30 Minutes, Escrow-Protected
            </span>
          </motion.h1>

          <motion.p 
            className="mx-auto max-w-2xl text-lg md:text-xl mb-8 text-center text-blue-50"
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.2 }}
          >
            Trade digital payments, gift cards, and items for help you need right now. 
            <span className="font-semibold text-white"> All perks are held in escrow</span> until you confirm completion.
            Only <span className="font-semibold text-white">5% fee</span> on successful tasks.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Link 
              href="/login"
              className="group inline-flex items-center gap-2 rounded-full px-8 py-4 shadow-2xl bg-white text-indigo-600 hover:bg-gray-50 font-semibold transition-all hover:gap-3 text-lg"
            >
              Post Your First Task Free
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <button 
              onClick={() => setShowVideo(true)}
              className="inline-flex items-center gap-2 rounded-full px-6 py-4 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 font-semibold transition-colors"
            >
              <Play size={20} />
              Watch 90s Demo
            </button>
          </motion.div>

          {/* Hero stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            {[
              { label: "Tasks completed today", value: tasksToday, isLive: true },
              { label: "Active in", value: "21 cities" },
              { label: "Escrow-protected success rate", value: "94%" }
            ].map((stat) => (
              <motion.div 
                key={stat.label} 
                className="text-center"
                variants={fadeUp}
                initial="hidden"
                animate="show"
                transition={{ delay: 0.6 }}
              >
                <div className="text-3xl md:text-4xl font-bold flex items-center justify-center gap-2">
                  {stat.value}
                  {stat.isLive && (
                    <span className="flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                  )}
                </div>
                <div className="text-sm opacity-80 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Modal */}
      <AnimatePresence>
        {showVideo && (
          <motion.div 
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowVideo(false)}
          >
            <motion.div 
              className="bg-white rounded-2xl p-2 max-w-4xl w-full relative"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setShowVideo(false)}
                className="absolute top-4 right-4 bg-gray-100 rounded-full p-2 hover:bg-gray-200 z-10"
              >
                <X size={20} />
              </button>
              <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">Video Demo Placeholder</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exchange Types */}
      <MotionSection className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">What Perks Work Best?</h2>
          <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
            Based on 50,000+ escrow-protected tasks. Choose these for fastest results:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {exchangeTypes.map(({ icon, title, desc, successRate, highlight }, i) => (
              <motion.div 
                key={title} 
                initial="hidden" 
                whileInView="show" 
                viewport={{ once: true, margin: "-50px" }} 
                variants={fadeUp} 
                transition={{ delay: 0.05 * i }}
              >
                <div className={`p-6 h-full rounded-2xl text-center transition-all ${
                  highlight 
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl scale-105' 
                    : 'bg-white border-2 hover:border-indigo-200 hover:shadow-xl'
                }`}>
                  <div className="text-4xl mb-3">{icon}</div>
                  <div className="flex justify-center mb-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      highlight 
                        ? 'bg-green-400/20 text-green-100' 
                        : 'bg-green-100 text-green-800'
                    }`}>{successRate}</span>
                  </div>
                  <h4 className="text-lg font-semibold mb-2">{title}</h4>
                  <p className={highlight ? 'text-indigo-100' : 'text-gray-600'}>{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </MotionSection>

      {/* Top Use Cases */}
      <MotionSection className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">Real Emergencies, Real Solutions</h2>
          <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
            See how people save time and money every day – all safely locked in escrow
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {topScenarios.slice(0, 6).map(({ icon: Icon, title, description, perk, time }, i) => (
              <motion.div 
                key={title}
                className="group"
                initial="hidden" 
                whileInView="show" 
                viewport={{ once: true }} 
                variants={fadeUp} 
                transition={{ delay: 0.05 * i }}
              >
                <Link 
                  href="/login"
                  className="block p-6 h-full bg-white rounded-2xl border-2 hover:border-indigo-300 hover:shadow-xl transition-all cursor-pointer"
                >
                  <Icon size={32} className="text-indigo-600 group-hover:scale-110 transition-transform mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{title}</h3>
                  <p className="text-gray-600 mb-4">{description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">Perk:</span>
                      <span className="font-medium text-indigo-600">{perk}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock size={14} className="text-gray-400" />
                      <span className="text-green-600 font-medium">{time}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </MotionSection>

      {/* Testimonials */}
      <MotionSection className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Join 12,000+ Happy Users</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map(({ quote, name, role, photo }, i) => (
              <motion.blockquote 
                key={name} 
                className="bg-gray-50 p-8 rounded-2xl"
                initial="hidden" 
                whileInView="show" 
                viewport={{ once: true, margin: "-50px" }} 
                variants={fadeUp} 
                transition={{ delay: 0.1 * i }}
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className="text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <p className="text-lg mb-6 text-gray-700">&ldquo;{quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{photo}</span>
                  <div>
                    <div className="font-semibold">{name}</div>
                    <div className="text-sm text-gray-600">{role}</div>
                  </div>
                </div>
              </motion.blockquote>
            ))}
          </div>
        </div>
      </MotionSection>

      {/* FAQ */}
      <MotionSection className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Common Questions</h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, i) => (
              <motion.div 
                key={i}
                className="border rounded-lg bg-white"
                initial="hidden" 
                whileInView="show" 
                viewport={{ once: true }} 
                variants={fadeUp} 
                transition={{ delay: 0.05 * i }}
              >
                <button
                  className="w-full text-left p-4 flex justify-between items-center hover:bg-gray-50"
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                >
                  <span className="font-medium">{faq.q}</span>
                  <span className="text-2xl text-gray-400">
                    {expandedFaq === i ? '−' : '+'}
                  </span>
                </button>
                <AnimatePresence>
                  {expandedFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="p-4 pt-0 text-gray-600">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </MotionSection>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
        <div className="container mx-auto px-6 text-center relative">
          <motion.h2 
            className="text-4xl md:text-6xl font-extrabold mb-6"
            initial="hidden" 
            whileInView="show" 
            viewport={{ once: true, margin: "-50px" }} 
            variants={fadeUp}
          >
            Your Time Is Worth More
          </motion.h2>
          <motion.p 
            className="max-w-2xl mx-auto text-lg md:text-xl mb-10 text-blue-100"
            initial="hidden" 
            whileInView="show" 
            viewport={{ once: true, margin: "-50px" }} 
            variants={fadeUp} 
            transition={{ delay: 0.2 }}
          >
            Stop wasting hours on errands. Join 12,000+ people getting stuff done smarter.
            <span className="block mt-2 text-white font-semibold">
              Average task completed in 23 minutes. 100% of perks held in escrow until you say so.
            </span>
          </motion.p>
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }} 
            whileInView={{ scale: 1, opacity: 1 }} 
            viewport={{ once: true, margin: "-50px" }} 
            transition={{ delay: 0.4 }}
          >
            <Link 
              href="/login"
              className="group inline-flex items-center gap-2 rounded-full px-10 py-5 shadow-2xl bg-white text-indigo-600 hover:bg-gray-50 font-bold transition-all hover:gap-3 text-lg"
            >
              Start Free – Post in 30 Seconds
              <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <h3 className="text-white text-2xl font-bold mb-4">TaskForPerks</h3>
            <p className="mb-6 text-gray-300 max-w-2xl mx-auto">
              The smarter, escrow-backed way to get tasks done fast.
            </p>
            <Link 
              href="/login"
              className="bg-indigo-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-indigo-700 transition-colors mb-8 inline-block"
            >
              Get Started Free
            </Link>
            <div className="border-t border-gray-800 pt-8">
              <p className="text-sm">© 2025 TaskForPerks Ltd. All rights reserved.</p>
              <p className="text-xs text-gray-500 mt-2">TaskForPerks Ltd is an FCA-registered e-money agent. Client funds are safeguarded in segregated accounts.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}