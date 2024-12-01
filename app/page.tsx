'use client'

import { SignInButton, SignedIn, SignedOut, useAuth } from "@clerk/nextjs";
import { BackgroundBeamsWithCollision } from "@/components/home/background-beams-with-collision";
import { Bentodemo } from "@/components/home/bentogrid";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Globe } from "lucide-react";
import Image from "next/image";
import { LinkPreview } from "@/components/ui/link-preview";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Language, translations } from '@/components/home/translations';
import FUIBentoGridDark from "@/components/Farmui";

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [language, setLanguage] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(false);
  const t = translations[language];

  const pricingPlans = t.pricingPlans;
  const handleDashboardClick = () => {
    setIsLoading(true);
    // Simulate loading for 1 second
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  {
    pricingPlans.map((plan, index) => (
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
              {plan.name !== "Entreprise" && <span className="text-base font-medium text-muted-foreground">/mois</span>}
            </div>
            <ul className="mt-8 space-y-4">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="h-5 w-5 text-primary" />
                  <p className="ml-3 text-sm sm:text-base text-muted-foreground">{feature}</p>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant={plan.name === "Pro" ? "default" : "outline"}>
              {plan.name === "Entreprise" ? "Contact Sales" : t.getStarted}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    ))
  }


  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative min-h-screen overflow-hidden"
    >
      <div className="gradient-background" />

      <div className="absolute inset-0 w-full h-full min-h-screen z-0 pointer-events-none opacity-40">
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
            <nav className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Globe className="h-[1.2rem] w-[1.2rem]" />
                    <span className="sr-only">Toggle language</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setLanguage("en")}>
                    English
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage("fr")}>
                    Français
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage("es")}>
                    Español
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <SignedIn>
                <Link href="/dashboard" passHref>
                  <Button variant="outline" onClick={handleDashboardClick} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        Loading...
                      </>
                    ) : (
                      t.dashboard
                    )}
                  </Button>
                </Link>
              </SignedIn>
              <SignedOut>
                <SignInButton>
                  <Button variant="outline">{t.getStarted}</Button>
                </SignInButton>
              </SignedOut>
            </nav>
          </div>
        </header>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center py-24 sm:py-32 relative z-20 max-w-5xl mx-auto"
        >
          <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-purple-50/50 to-transparent" />
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground"
          >
            <span className="block mb-4">{t.title}</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
              {t.subtitle}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-8 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            {t.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <SignedOut>
              <SignInButton>
                <Button 
                  size="lg" 
                  className="min-w-[200px] bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {t.getStarted}
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard" passHref>
                <Button 
                  size="lg"
                  className="min-w-[200px] bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={handleDashboardClick} 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Loading...
                    </>
                  ) : (
                    t.dashboard
                  )}
                </Button>
              </Link>
            </SignedIn>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="min-w-[200px] border-2 hover:bg-gray-50/50"
            >
              {t.liveDemo}
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="mt-16 flex justify-center gap-8 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-200"
          >
            {/* Vous pouvez ajouter ici des logos de partenaires/clients */}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.3 }}
          className="py-24 relative z-20"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.4 }}
              >
                <span className="text-sm font-semibold tracking-wide uppercase bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
                  {t.features}
                </span>
              </motion.div>
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.5 }}
                className="mt-4 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground"
              >
                {t.featuresTitle}
              </motion.h2>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.6 }}
                className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground"
              >
                Découvrez toutes les fonctionnalités qui font de Sphere AI une plateforme unique.
              </motion.p>
            </div>

            <div className="relative">
              {/* Effet de brillance en arrière-plan */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -inset-x-40 -top-40 h-[500px] w-[800px] opacity-50 bg-gradient-radial from-purple-500/20 to-transparent blur-3xl" />
                <div className="absolute -inset-x-40 -bottom-40 h-[500px] w-[800px] opacity-50 bg-gradient-radial from-blue-500/20 to-transparent blur-3xl" />
              </div>

              {/* Conteneur pour les deux grilles */}
              <div className="relative space-y-16">
                {/* Première grille - Bentodemo */}
                <div className="relative backdrop-blur-sm rounded-2xl p-4">
                  <Bentodemo language={language} />
                </div>

                {/* Deuxième grille - FUIBentoGridDark */}
                <div className="relative backdrop-blur-sm rounded-2xl p-4">
                  <FUIBentoGridDark />
                </div>
              </div>
            </div>

            {/* Badges ou statistiques */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.7 }}
              className="mt-20 grid grid-cols-2 gap-6 md:grid-cols-4"
            >
              {[
                { number: "99%", label: "Satisfaction" },
                { number: "24/7", label: "Support" },
                { number: "100+", label: "Intégrations" },
                { number: "50k+", label: "Utilisateurs" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1.8 + index * 0.1 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-100/50 to-blue-100/50 rounded-lg blur-xl transition-all duration-300 group-hover:blur-2xl opacity-70" />
                  <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
                      {stat.number}
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
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
                {t.pricing}
              </h2>
              <p className="mt-3 max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground">
                {t.pricingDescription}
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
                      <LinkPreview url="https://www.google.com" >
                        <CardTitle>{plan.name}</CardTitle>
                      </LinkPreview>
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
                        {plan.name === "Enterprise" ? "Contact Sales" : t.getStarted}
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
              <span className="block">{t.ready}</span>
              <span className="block text-primary mt-2">{t.join}</span>
            </h2>
            <div className="mt-8 flex justify-center lg:mt-0 lg:flex-shrink-0">
              <div className="inline-flex rounded-md shadow">
                <SignedOut>
                  <SignInButton>
                    <Button size="lg">{t.getStarted}</Button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <Link href="/dashboard" passHref>
                    <Button size="lg" className="w-full sm:w-auto" onClick={handleDashboardClick} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                          Loading...
                        </>
                      ) : (
                        t.dashboard
                      )}
                    </Button>
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
                {t.stayUpdated}
              </h2>
              <p className="mt-3 max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground">
                {t.newsletter}
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
                  {t.notifyMe}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </motion.main>
  );
}
