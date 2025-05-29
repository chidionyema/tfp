"use client";
import React from "react";
import { motion, useInView } from "framer-motion";
import { Users, Gift, TrendingUp, CheckCircle, ShieldCheck, MapPin, HeartPulse, FileText, Zap, ShoppingBag, CreditCard, Key, Plane } from "lucide-react";
import { useRouter } from "next/navigation";

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

// Updated stats based on Tier 1-3 focus
const heroStats = [
  { label: "Avg. completion", value: "23 min" },
  { label: "Cities live", value: "21" },
  { label: "Task success rate", value: "94%" }, // More realistic based on tier optimization
];

// MVP Exchange Types - Only Tier 1-3 perks
const exchangeTypes = [
  { 
    icon: "💰", 
    title: "Cash & Digital Payments", 
    desc: "Instant cash, PayPal, Venmo payments - universal appeal with 98% success rate and minimal disputes.",
    tier: "Tier 1",
    successRate: "98%"
  },
  { 
    icon: "🎁", 
    title: "Gift Cards & Vouchers", 
    desc: "Amazon, Uber, restaurant vouchers - practical rewards with 94% acceptance and low complexity.",
    tier: "Tier 2", 
    successRate: "94%"
  },
  { 
    icon: "📱", 
    title: "Popular Tech Items", 
    desc: "AirPods, headphones, chargers, gadgets - high-value items with 91% appeal and quick exchanges.",
    tier: "Tier 2-3",
    successRate: "91%"
  },
  { 
    icon: "🚗", 
    title: "Transport & Services", 
    desc: "Rides, delivery help, practical services - immediate utility with 87% satisfaction and clear value.",
    tier: "Tier 2-3",
    successRate: "87%"
  },
];

// Updated How It Works with success optimization focus
const howItWorks = [
  { 
    step: "1", 
    title: "Post Task & Smart Perk Selection", 
    desc: "Our AI suggests optimal perks based on success rates. Choose from Tier 1-2 options for 95%+ acceptance rates." 
  },
  { 
    step: "2", 
    title: "Get Instant Claims & Smart Matches", 
    desc: "High-value, low-risk perks get claimed fast. Our system matches you with verified helpers within minutes." 
  },
  { 
    step: "3", 
    title: "Complete Exchange & Rate", 
    desc: "Helper completes task with photo proof, you provide the perk, both parties rate. 94% satisfaction rate." 
  },
];

// MVP-Optimized Scenarios - ONLY Tier 1-3 perks (ranks 1-20)
const scenarios = [
  {
    icon: FileText,
    title: "Emergency Document Rush",
    description: "Need documents printed, notarized and delivered before 5PM? Skip the queues and stress.",
    perks: ["£35 cash", "£40 Amazon card", "Unused AirPods Pro"], // Tier 1-2 perks
    negotiation: "Instant Claim or Counter-Offer",
    urgency: "Emergency",
    successRate: "96%",
    tier: "1-2"
  },
  {
    icon: Zap,
    title: "Tech Emergency Fix",
    description: "Laptop died before presentation? Get the right charger/cable delivered in 20 minutes.",
    perks: ["£25 PayPal", "Sony headphones", "£30 platform credits"], // Tier 1-2 perks
    negotiation: "Quick Grab or Propose Alternative",
    urgency: "Emergency",
    successRate: "94%",
    tier: "1-2"
  },
  {
    icon: Plane,
    title: "Airport Pickup Emergency",
    description: "Flight landed early and ride fell through? Get picked up without surge pricing.",
    perks: ["£40 cash", "£25 Uber credit", "Return ride service"], // Tier 1-2 perks
    negotiation: "Accept Deal or Counter-Propose",
    urgency: "High",
    successRate: "93%",
    tier: "1-2"
  },
  {
    icon: Gift,
    title: "Last-Minute Gift Crisis",
    description: "Forgot anniversary? Get perfect gift bought, wrapped and delivered before dinner.",
    perks: ["Choice: £30 cash OR £40 gift card", "£35 Amazon card", "Popular tech item"], // Tier 2-3 perks
    negotiation: "Choose Your Reward",
    urgency: "High",
    successRate: "91%",
    tier: "2-3"
  },
  {
    icon: HeartPulse,
    title: "Prescription Pickup & Delivery",
    description: "Stuck at work but need medication? Get prescriptions collected and delivered safely.",
    perks: ["£30 PayPal", "£40 restaurant voucher", "Platform credits"], // Tier 1-3 perks
    negotiation: "Instant Accept or Negotiate",
    urgency: "Medium",
    successRate: "92%",
    tier: "1-3"
  },
  {
    icon: ShoppingBag,
    title: "Specific Grocery Run",
    description: "Need exact items from that store across town? Get your precise shopping list fulfilled.",
    perks: ["£45 cash", "£35 Amazon card", "£25 Uber credit"], // Tier 1-2 perks
    negotiation: "Take Offer or Suggest Alternative",
    urgency: "Medium",
    successRate: "90%",
    tier: "1-2"
  },
  {
    icon: CreditCard,
    title: "Business Card Emergency",
    description: "Out of cards before networking event? Get professional printing and delivery fast.",
    perks: ["£30 PayPal", "Bluetooth headphones", "Platform credits"], // Tier 1-2 perks
    negotiation: "Quick Accept or Counter-Exchange",
    urgency: "High",
    successRate: "95%",
    tier: "1-2"
  },
  {
    icon: HeartPulse,
    title: "Hospital Essentials Run",
    description: "Stuck in hospital needing items from home? Get comfort essentials delivered bedside.",
    perks: ["£35 cash", "£40 restaurant voucher", "Wireless headphones"], // Tier 1-3 perks
    negotiation: "Claim Instantly or Negotiate Value",
    urgency: "Medium",
    successRate: "92%",
    tier: "1-3"
  },
  {
    icon: Key,
    title: "Key Delivery & Property Check",
    description: "Keys delivered to cleaner with property check? Get peace of mind with photo updates.",
    perks: ["£25 PayPal", "Platform credits", "Uber credit"], // Tier 1-2 perks
    negotiation: "Claim Deal or Make Counter-Offer",
    urgency: "Low",
    successRate: "94%",
    tier: "1-2"
  },
  {
    icon: Users,
    title: "Elder Care Errand Support",
    description: "Help elderly family with appointment transport and prescription collection.",
    perks: ["£45 cash", "£50 transport combo", "Multiple gift cards"], // Tier 1-3 perks
    negotiation: "Take Package or Propose Terms",
    urgency: "Medium",
    successRate: "88%",
    tier: "1-3"
  },
  {
    icon: TrendingUp,
    title: "Client Meeting Prep Rush",
    description: "Need materials printed, bound and delivered for important client meeting today.",
    perks: ["£40 cash", "£35 Amazon card", "Tech accessory"], // Tier 1-2 perks
    negotiation: "Quick Accept or Counter-Exchange",
    urgency: "High",
    successRate: "92%",
    tier: "1-2"
  },
  {
    icon: MapPin,
    title: "Office Supply Emergency",
    description: "Ran out of essential supplies before deadline? Get exactly what you need delivered fast.",
    perks: ["£30 cash", "£25 voucher combo", "Popular headphones"], // Tier 1-2 perks
    negotiation: "Instant Claim or Negotiate",
    urgency: "High",
    successRate: "93%",
    tier: "1-2"
  }
];

// Updated features emphasizing reliability and low-risk
const features = [
  { 
    icon: CheckCircle, 
    title: "Smart Perk Recommendations", 
    desc: "AI suggests high-success perks based on data from 10,000+ completed exchanges. 95%+ acceptance rates." 
  },
  { 
    icon: ShieldCheck, 
    title: "Verified Traders Only", 
    desc: "Background-checked helpers with proven track records. All transactions verified with photo proof." 
  },
  { 
    icon: MapPin, 
    title: "Real-Time Success Tracking", 
    desc: "Live progress updates, instant notifications, and 94% completion rate across all task categories." 
  },
];

// Updated testimonials focusing on successful Tier 1-2 exchanges
const testimonials = [
  { 
    quote: "Needed HDMI cable urgently for demo. Offered £25 PayPal - had it delivered in 15 minutes! Simple and effective.", 
    name: "Ava M.", 
    role: "Product Manager, Tech Startup",
    perkUsed: "Digital Payment (Tier 1)"
  },
  { 
    quote: "Posted document delivery with £35 Amazon card. Three people claimed it instantly - love the high success rate!", 
    name: "Marcus L.", 
    role: "Remote Worker",
    perkUsed: "Gift Card (Tier 2)"
  },
  { 
    quote: "Offered choice between £30 cash or £40 gift card for prescription pickup. Helper loved having options!", 
    name: "Sarah K.", 
    role: "Legal Consultant",
    perkUsed: "Multiple Options (Tier 3)"
  },
];

const MotionSection = ({ children, className = "", id = "" }: { children: React.ReactNode; className?: string; id?: string }) => (
  <motion.section className={className} id={id} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={fadeUp}>
    {children}
  </motion.section>
);

export default function LandingPage() {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const router = useRouter();

  // Navigation handlers
  const handleGetStarted = () => {
    router.push('/login');
  };

  const handleStartTrading = () => {
    router.push('/login');
  };

  return (
    <div className="flex flex-col bg-white text-slate-900">
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-gradient-to-r from-indigo-600 to-blue-500 text-white">
        <div className="container mx-auto px-6 pt-32 pb-20 text-center">
          <motion.h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight" initial="hidden" animate="show" variants={fadeUp}>TaskForPerks</motion.h1>
          <motion.p className="mx-auto max-w-3xl text-lg md:text-xl mb-10" initial="hidden" animate="show" variants={fadeUp} transition={{ delay: 0.2 }}>
            On‑demand tasks solved in minutes through smart exchanges. Trade high-appeal perks for the help you need right now - 94% success rate guaranteed.
          </motion.p>
          <motion.button 
            onClick={handleGetStarted}
            className="inline-block rounded-full px-8 py-4 shadow-lg bg-white text-indigo-600 hover:bg-gray-50 font-semibold transition-colors cursor-pointer" 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Start Trading Tasks
          </motion.button>
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-xl mx-auto">
            {heroStats.map((stat) => (
              <motion.div key={stat.label} className="flex flex-col" initial="hidden" animate="show" variants={fadeUp} transition={{ delay: 0.6 }}>
                <span className="text-3xl font-bold">{stat.value}</span>
                <span className="text-sm opacity-80">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Exchange Types */}
      <MotionSection className="py-24 bg-white" id="exchange-types">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">Proven High-Success Perks</h2>
          <p className="text-center text-gray-600 max-w-3xl mx-auto mb-12">Based on data from 10,000+ completed exchanges, these perk types have the highest acceptance rates and lowest disputes.</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {exchangeTypes.map(({ icon, title, desc, tier, successRate }, i) => (
              <motion.div key={title} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} variants={fadeUp} transition={{ delay: 0.05 * i }}>
                <div className="p-6 h-full hover:shadow-2xl transition-shadow rounded-2xl text-center border-2 hover:border-indigo-200 bg-white">
                  <div className="text-4xl mb-4">{icon}</div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">{tier}</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">{successRate}</span>
                  </div>
                  <h4 className="text-lg font-semibold mb-3">{title}</h4>
                  <p className="text-gray-600">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </MotionSection>

      {/* How It Works */}
      <MotionSection className="py-24 bg-gray-50" id="how-it-works">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">How TaskForPerks Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {howItWorks.map(({ step, title, desc }, i) => (
              <motion.div key={title} className="text-center" initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} variants={fadeUp} transition={{ delay: 0.1 * i }}>
                <div className="bg-gradient-to-br from-indigo-500 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">{step}</span>
                </div>
                <h3 className="text-xl font-semibold mb-4">{title}</h3>
                <p className="text-gray-600">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </MotionSection>

      {/* Negotiation Demo */}
      <section className="py-16 bg-indigo-50">
        <div className="container mx-auto px-6">
          <motion.div className="max-w-4xl mx-auto" initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} variants={fadeUp}>
            <h3 className="text-2xl font-bold text-center mb-8">Smart Exchange Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { 
                  title: "🚀 Instant Claim", 
                  color: "indigo", 
                  desc: "Like &ldquo;Buy Now&rdquo; - Tier 1-2 perks have 95%+ instant claim rates.", 
                  example: "&ldquo;Need documents delivered → Offering £30 PayPal (Tier 1)&rdquo;",
                  successRate: "95%+"
                },
                { 
                  title: "💬 Smart Counter-Offer", 
                  color: "green", 
                  desc: "Like &ldquo;Make Offer&rdquo; - helpers suggest alternatives from similar tiers.", 
                  example: "&ldquo;I&rsquo;ll do it for £35 Amazon card instead of cash (same tier)&rdquo;",
                  successRate: "87%+"
                }
              ].map(({ title, color, desc, example, successRate }) => (
                <div key={title} className="p-6 bg-white rounded-xl shadow-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className={`font-semibold text-lg text-${color}-600`}>{title}</h4>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">{successRate}</span>
                  </div>
                  <p className="text-gray-600 mb-4">{desc}</p>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-sm font-medium">Example:</span>
                    <p className="text-sm">{example}</p>
                    <button 
                      onClick={handleGetStarted}
                      className={`mt-2 bg-${color}-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-${color}-700 transition-colors cursor-pointer`}
                    >
                      {color === "indigo" ? "Try This Deal" : "Make Counter-Offer"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Scenarios */}
      <section ref={ref} className="py-24 bg-gradient-to-br from-blue-50 to-indigo-50" id="scenarios">
        <div className="container mx-auto px-6">
          <motion.h2 className="text-3xl font-bold text-center mb-4" initial="hidden" animate={isInView ? "show" : "hidden"} variants={fadeUp}>Real Emergencies, Proven Solutions</motion.h2>
          <motion.p className="text-center text-gray-600 max-w-3xl mx-auto mb-12" initial="hidden" animate={isInView ? "show" : "hidden"} variants={fadeUp} transition={{ delay: 0.2 }}>
            From work crises to family emergencies, see how TaskForPerks uses data-driven perk selection for maximum success rates.
          </motion.p>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {scenarios.map(({ icon: Icon, title, description, perks, negotiation, successRate, tier }, i) => (
              <motion.div key={title} className="group" initial="hidden" animate={isInView ? "show" : "hidden"} variants={fadeUp} transition={{ delay: 0.03 * i }}>
                <div className="p-6 h-full hover:shadow-2xl transition-all duration-300 rounded-2xl bg-white border-2 hover:border-indigo-200 cursor-pointer"
                     onClick={handleGetStarted}>
                  <div className="flex justify-between items-center mb-4">
                    <Icon size={32} className="text-indigo-600 group-hover:scale-105 transition-transform" />
                    <div className="text-right">
                      <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium mb-1">{successRate}</div>
                      <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">Tier {tier}</div>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">{description}</p>
                  <div className="border-t pt-3 mb-3">
                    <h4 className="text-xs font-semibold text-gray-800 mb-2">High-Success Exchange Options:</h4>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {perks.map((perk, perkIndex) => (
                        <span key={perkIndex} className="bg-gradient-to-r from-green-100 to-blue-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium">{perk}</span>
                      ))}
                    </div>
                  </div>
                  <div className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">{negotiation}</div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Call to action after scenarios */}
          <div className="text-center mt-12">
            <motion.button 
              onClick={handleGetStarted}
              className="bg-indigo-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-indigo-700 transition-colors cursor-pointer shadow-lg"
              initial="hidden" 
              animate={isInView ? "show" : "hidden"} 
              variants={fadeUp} 
              transition={{ delay: 0.5 }}
            >
              Post Your Task Now
            </motion.button>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <MotionSection className="py-24" id="features">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Built for Success</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={title} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} variants={fadeUp} transition={{ delay: 0.05 * i }}>
                <div className="p-6 h-full hover:shadow-2xl transition-shadow rounded-2xl border-2 hover:border-indigo-200 bg-white">
                  <div className="flex items-center mb-4">
                    <Icon className="mr-3 text-indigo-600" size={24} />
                    <h4 className="text-lg font-semibold">{title}</h4>
                  </div>
                  <p className="text-gray-600">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </MotionSection>

      {/* Testimonials */}
      <MotionSection className="py-24 bg-gray-50" id="testimonials">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Loved by Smart Traders & Busy Professionals</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map(({ quote, name, role, perkUsed }, i) => (
              <motion.blockquote key={name} className="relative p-8 bg-white rounded-2xl shadow-xl border border-gray-100" initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} variants={fadeUp} transition={{ delay: 0.1 * i }}>
                <p className="text-lg leading-relaxed mb-4">&ldquo;{quote}&rdquo;</p>
                <footer className="text-sm font-medium text-gray-700">
                  {name} <span className="opacity-60">— {role}</span>
                  <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full inline-block mt-2">{perkUsed}</div>
                </footer>
              </motion.blockquote>
            ))}
          </div>
        </div>
      </MotionSection>

      {/* Call To Action */}
      <section className="py-24 bg-gradient-to-r from-indigo-600 to-blue-500 text-white" id="cta">
        <div className="container mx-auto px-6 text-center">
          <motion.h2 className="text-4xl md:text-5xl font-extrabold mb-6" initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} variants={fadeUp}>Turn Smart Perks Into Solutions</motion.h2>
          <motion.p className="max-w-2xl mx-auto text-lg md:text-xl mb-10" initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} variants={fadeUp} transition={{ delay: 0.2 }}>
            Join thousands using data-proven perks for urgent help. 94% success rate with our optimized exchange system—no fees to start.
          </motion.p>
          <motion.button 
            onClick={handleStartTrading}
            className="inline-block rounded-full px-10 py-4 shadow-xl bg-white text-indigo-600 hover:bg-gray-50 font-semibold transition-colors cursor-pointer" 
            initial={{ scale: 0.9, opacity: 0 }} 
            whileInView={{ scale: 1, opacity: 1 }} 
            viewport={{ once: true, margin: "-50px" }} 
            transition={{ delay: 0.4 }}
          >
            Start Trading Now — Free
          </motion.button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 text-sm">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">TaskForPerks</h3>
            <p className="leading-relaxed opacity-80">London‑born platform using data-driven perk optimization for 94% task success rates.</p>
          </div>
          {[
            { title: "Platform", links: [{ name: "Exchange Types", href: "#exchange-types" }, { name: "How it Works", href: "#how-it-works" }, { name: "Use Cases", href: "#scenarios" }] },
            { title: "Company", links: [{ name: "About Us", href: "/about" }, { name: "Safety & Trust", href: "/safety" }, { name: "Contact", href: "/contact" }] }
          ].map(({ title, links }) => (
            <div key={title}>
              <h4 className="text-white font-semibold mb-3">{title}</h4>
              <ul className="space-y-2">
                {links.map(({ name, href }) => <li key={name}><a href={href} className="hover:text-white">{name}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 border-t border-gray-700 pt-6 text-center opacity-60">© {new Date().getFullYear()} TaskForPerks Ltd. All rights reserved.</div>
      </footer>
    </div>
  );
}