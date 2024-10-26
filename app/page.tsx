'use client'

import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { BackgroundBeamsWithCollision } from "@/components/home/background-beams-with-collision";
import Bentodemoo from "@/components/home/bentogrid";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import Image from "next/image";

export default function LandingPage() {
  const [email, setEmail] = useState("");

  const pricingPlans = [
    {
      name: "Starter",
      price: "$29",
      description: "Perfect for small teams and startups",
      features: ["Up to 5 team members", "Basic AI assistance", "10 GB storage", "Email support"],
    },
    {
      name: "Pro",
      price: "$99",
      description: "Ideal for growing businesses",
      features: ["Up to 20 team members", "Advanced AI features", "50 GB storage", "Priority support"],
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large organizations with specific needs",
      features: ["Unlimited team members", "Custom AI solutions", "Unlimited storage", "24/7 dedicated support"],
    },
  ];

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative bg-background min-h-screen overflow-hidden"
    >
      <div className="absolute inset-0 w-full h-full min-h-screen z-0 pointer-events-none">
        <BackgroundBeamsWithCollision children={undefined} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative h-64 overflow-hidden">
          <Image
            src="/globe.svg"
            alt="Background Globe"
            layout="fill"
            objectFit="cover"
            className="opacity-8"
          />
        </div>
        
        <header className="py-6 relative z-50 -mt-64">
          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-2xl font-bold text-primary"
            >
              Sphere AI
            </motion.div>
            <nav>
              <SignedIn>
                <Link href="/dashboard" passHref>
                  <Button variant="outline">Dashboard</Button>
                </Link>
              </SignedIn>
              <SignedOut>
                <SignInButton>
                  <Button variant="outline">Sign in</Button>
                </SignInButton>
              </SignedOut>
            </nav>
          </div>
        </header>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center py-12 sm:py-20 relative z-20"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight font-extrabold text-foreground">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="block"
            >
              Transform Your Workflow with
            </motion.span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="block text-primary mt-2"
            >
              AI-Powered Intelligence
            </motion.span>
          </h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="mt-6 max-w-md mx-auto text-base text-muted-foreground sm:text-lg md:mt-8 md:text-xl md:max-w-3xl"
          >
            Harness the power of artificial intelligence to automate tasks, optimize processes, and
            make data-driven decisions fast for modern teams.
          </motion.p>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.1 }}
            className="mt-8 max-w-md mx-auto sm:flex sm:justify-center"
          >
            <div className="rounded-md shadow">
              <SignedOut>
                <SignInButton>
                  <Button size="lg" className="w-full sm:w-auto">Get Started</Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard" passHref>
                  <Button size="lg" className="w-full sm:w-auto">Dashboard</Button>
                </Link>
              </SignedIn>
            </div>
            <div className="mt-3 sm:mt-0 sm:ml-3">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Live Demo
              </Button>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.3 }}
          className="py-12 bg-background relative z-20"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Features</h2>
              <p className="mt-2 text-2xl sm:text-3xl leading-8 font-extrabold tracking-tight text-foreground sm:text-4xl">
                Powerful Features for Modern Teams
              </p>
            </div>

            <div className="mt-10">
              <Bentodemoo />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.5 }}
          className="py-12 bg-background relative z-20"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground sm:text-4xl">
                Choose the Perfect Plan for Your Team
              </h2>
              <p className="mt-3 max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground">
                Select a plan that fits your needs and scale as you grow
              </p>
            </div>
            <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
              {pricingPlans.map((plan, index) => (
                <motion.div
                  key={plan.name}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1.7 + index * 0.2 }}
                >
                  <Card className="h-full flex flex-col justify-between">
                    <CardHeader>
                      <CardTitle>{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <span className="text-3xl sm:text-4xl font-extrabold text-primary">{plan.price}</span>
                        {plan.name !== "Enterprise" && <span className="text-base font-medium text-muted-foreground">/month</span>}
                      </div>
                      <ul className="mt-8 space-y-4">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <div className="flex-shrink-0">
                              <Check className="h-5 w-5 text-primary" />
                            </div>
                            <p className="ml-3 text-sm sm:text-base text-muted-foreground">{feature}</p>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full" variant={plan.name === "Pro" ? "default" : "outline"}>
                        {plan.name === "Enterprise" ? "Contact Sales" : "Get Started"}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.9 }}
          className="bg-muted rounded-lg shadow-lg my-12 relative z-20"
        >
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              <span className="block">Ready to Transform Your Workflow?</span>
              <span className="block text-primary mt-2">Join thousands of teams already using AISpere.</span>
            </h2>
            <div className="mt-8 flex justify-center lg:mt-0 lg:flex-shrink-0">
              <div className="inline-flex rounded-md shadow">
                <SignedOut>
                  <SignInButton>
                    <Button size="lg">Get Started</Button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <Link href="/dashboard" passHref>
                    <Button size="lg">Dashboard</Button>
                  </Link>
                </SignedIn>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 2.1 }}
          className="py-12 bg-background relative z-20"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                Stay Updated
              </h2>
              <p className="mt-3 max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground">
                Get the latest news and updates from AISpere delivered straight to your inbox.
              </p>
            </div>
            <form className="mt-8 sm:flex justify-center" onSubmit={(e) => e.preventDefault()}>
              <Label htmlFor="email-address" className="sr-only">
                Email address
              </Label>
              <Input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-5 py-3 placeholder-muted-foreground focus:ring-primary focus:border-primary sm:max-w-xs"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3 sm:flex-shrink-0">
                <Button type="submit" size="lg" className="w-full sm:w-auto">
                  Notify me
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </motion.main>
  );
}