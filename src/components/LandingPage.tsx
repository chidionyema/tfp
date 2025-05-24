"use client";
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, Button } from "@/components/ui";
import { CheckCircle, Users, TrendingUp, Gift } from "lucide-react";

// Refactored copy to emphasize on-demand micro-task service for clients under TaskForPerks
const scenarios = [
  {
    icon: <Users size={48} className="text-blue-500" />,
    title: "Emergency Errands Made Easy",
    description:
      "Need your shirt cleaned before a meeting? Request a quick launder-and-return service in minutes.",
  },
  {
    icon: <TrendingUp size={48} className="text-green-500" />,
    title: "Legal Tasks On Your Schedule",
    description:
      "Courier your documents to a notary and back—no office trip required, finished before your deadline.",
  },
  {
    icon: <Gift size={48} className="text-pink-500" />,
    title: "Home Care, Hassle-Free",
    description:
      "Water your plants and collect mail while you’re away—complete with proof-of-service photos.",
  },
  {
    icon: <Gift size={48} className="text-purple-500" />,
    title: "Unlock Any Quick-Service Task",
    description:
      "From grabbing gift bouquets to retrieving spare keys, delegates tasks to trusted partners instantly.",
  },
  {
    icon: <TrendingUp size={48} className="text-orange-500" />,
    title: "Tech Essentials Delivered",
    description:
      "Forgot your charger? Have a verified runner fetch and deliver critical hardware in record time.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative bg-gradient-to-r from-indigo-600 to-blue-500 text-white">
        <div className="container mx-auto px-6 py-32 text-center">
          <motion.h1
            className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            TaskForPerks
          </motion.h1>
          <motion.p
            className="max-w-2xl mx-auto text-lg md:text-xl mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            On-demand micro-tasks—any time, any place. From errands to essentials, we’ve got you covered.
          </motion.p>
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <Button size="lg" className="rounded-full px-8 py-4">
              Get Started
            </Button>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {scenarios.map((item, i) => (
              <Card key={i} className="p-8 hover:shadow-xl transition-shadow">
                <div className="mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Core Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 hover:shadow-xl transition-shadow">
              <CardContent>
                <div className="flex items-center mb-4">
                  <CheckCircle className="mr-2 text-green-500" />
                  <h4 className="text-lg font-semibold">Instant Requests</h4>
                </div>
                <p className="text-gray-600">Build your request with location, time, and fee in seconds.</p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-shadow">
              <CardContent>
                <div className="flex items-center mb-4">
                  <Users className="mr-2 text-blue-500" />
                  <h4 className="text-lg font-semibold">Trusted Runners</h4>
                </div>
                <p className="text-gray-600">Background-checked partners deliver reliable, photo-proof service.</p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-shadow">
              <CardContent>
                <div className="flex items-center mb-4">
                  <TrendingUp className="mr-2 text-blue-500" />
                  <h4 className="text-lg font-semibold">Real-Time Tracking</h4>
                </div>
                <p className="text-gray-600">Follow your runner on the map and get instant updates until completion.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-blue-500 text-white text-center">
        <div className="container mx-auto px-6">
          <h3 className="text-2xl font-semibold mb-4">Ready for Effortless Help?</h3>
          <Button size="lg" className="rounded-full px-8 py-4">
            Try TaskForPerks
          </Button>
        </div>
      </section>
    </div>
  );
}
