"use client";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import { FileText, Table, Search, BarChart2, RefreshCw, Smartphone } from "lucide-react";

export default function FUIBentoGridDark() {
     return (
          <div className="pt-32 container mx-auto">
            <h1 className="font-geistMono tracking-tight text-3xl md:text-5xl">
              Sales
            </h1>
            <p className="max-w-3xl text-2xl/8 font-medium tracking-tight mt-2 bg-gradient-to-br from-black/90 to-black/80 bg-clip-text text-transparent dark:from-white dark:to-white/40">
              Know more about your customers than they do.
            </p>
            <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-16 lg:grid-cols-6 lg:grid-rows-2">
              <BentoCard
                eyebrow="Insight"
                title="Get perfect clarity"
                description="PerkAI uses social engineering to build a detailed financial picture of your leads. Know their budget, compensation package, social security number, and more."
                graphic={
                  <div className="absolute inset-0 overflow-hidden">
                    <video 
                      autoPlay 
                      loop 
                      muted 
                      playsInline
                      className="w-full h-full object-cover"
                    >
                      <source src="/mindmap.mp4" type="video/mp4" />
                      {/* Fallback pour les navigateurs qui ne supportent pas la vidéo */}
                      <video 
                        src="/mindmap.mp4" 
                        className="w-full h-full object-cover" 
                      />
                    </video>
                  </div>
                }
                className="max-lg:rounded-t-4xl lg:col-span-3 lg:rounded-tl-4xl"
              />
              <BentoCard
                eyebrow="Analysis"
                title="Document Intelligence"
                description="Advanced document processing and analysis with AI-powered insights."
                graphic={
                  <div className="absolute inset-0 group">
                    <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-indigo-50/10 via-slate-50/5 to-gray-50/10 dark:from-slate-900/20">
                      <div className="animate-scroll group-hover:pause-animation h-full">
                        <div className="flex flex-col gap-4 p-6">
                          {[
                            { 
                              icon: <FileText className="w-6 h-6 text-indigo-300" />,
                              title: "PDF Analysis",
                              desc: "Smart document parsing" 
                            },
                            { 
                              icon: <Table className="w-6 h-6 text-indigo-300" />,
                              title: "Data Tables",
                              desc: "Structured data extraction" 
                            },
                            { 
                              icon: <Search className="w-6 h-6 text-indigo-300" />,
                              title: "Smart Search",
                              desc: "Semantic document search" 
                            },
                            { 
                              icon: <BarChart2 className="w-6 h-6 text-indigo-300" />,
                              title: "Analytics",
                              desc: "Visual insights" 
                            },
                            { 
                              icon: <RefreshCw className="w-6 h-6 text-indigo-300" />,
                              title: "Auto-Sync",
                              desc: "Real-time updates" 
                            },
                            { 
                              icon: <Smartphone className="w-6 h-6 text-indigo-300" />,
                              title: "Mobile Ready",
                              desc: "Access anywhere" 
                            }
                          ].map((item, index) => (
                            <div 
                              key={index}
                              className="transform transition-all duration-500 hover:scale-102"
                            >
                              <div className="bg-white/5 dark:bg-slate-900/20 backdrop-blur-md p-4 rounded-xl border border-white/20 dark:border-slate-700/30 shadow-lg hover:shadow-indigo-500/10 transition-all duration-300">
                                <div className="flex items-center gap-4">
                                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-slate-50/10 to-indigo-500/10 dark:from-slate-800/50 dark:to-indigo-900/50 flex items-center justify-center shadow-inner">
                                    {item.icon}
                                  </div>
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-slate-700 dark:text-slate-200">{item.title}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Overlay glassmorphism amélioré */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700">
                      <div className="h-full w-full backdrop-blur-[8px] bg-gradient-to-br from-white/40 via-slate-50/30 to-indigo-50/20 dark:from-slate-900/40 dark:via-slate-800/30 dark:to-indigo-900/20 transition-all duration-500">
                        <div className="h-full flex flex-col justify-center items-center p-8">
                          <div className="glass-card-hover p-8 rounded-2xl shadow-2xl">
                            <h3 className="text-xl font-medium mb-6 text-slate-800 dark:text-slate-100">
                              Document Processing
                            </h3>
                            <div className="space-y-4">
                              {[
                                { label: "PDF & Documents", value: "Smart Parsing" },
                                { label: "Data Extraction", value: "99.9% Accuracy" },
                                { label: "Processing Time", value: "<2 seconds" }
                              ].map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/5 dark:bg-slate-800/30 backdrop-blur-lg">
                                  <span className="text-slate-600 dark:text-slate-300 font-medium">{item.label}</span>
                                  <span className="text-indigo-500 dark:text-indigo-300 font-mono text-sm">{item.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                }
                className="lg:col-span-3 lg:rounded-tr-4xl group transition-all duration-500"
              />
              <BentoCard
                eyebrow="Speed"
                title="Built for power users"
                description="It's never been faster to cold email your entire contact list using our streamlined keyboard shortcuts."
                graphic={
                  <div className="absolute  inset-0 -top-20 -left-60 bg-[url(https://framerusercontent.com/images/gR21e8Wh6l3pU6CciDrqt8wjHM.png)] object-scale-down" />
                }
                className="lg:col-span-2 lg:rounded-bl-4xl"
              />
              <BentoCard
                eyebrow="Source"
                title="Get the furthest reach"
                description="Bypass those inconvenient privacy laws to source leads from the most unexpected places."
                graphic={
                  <div className="absolute inset-0 bg-[url(https://framerusercontent.com/images/PTO3RQ3S65zfZRFEGZGpiOom6aQ.png)] object-contain" />
                }
                className="lg:col-span-2"
              />
              <BentoCard
                eyebrow="Limitless"
                title="Sell globally"
                description="PerkAI helps you sell in locations currently under international embargo."
                graphic={
                  <div className="absolute inset-0 -top-44 -left-60 bg-[url(https://framerusercontent.com/images/h496iPSwtSnGZwpJyErl6cLWdtE.png)] object-contain" />
                }
                className="max-lg:rounded-b-4xl lg:col-span-2 lg:rounded-br-4xl"
              />
            </div>
          </div>
        );
      }
  export function BentoCard({
     dark = false,
     className = "",
     eyebrow,
     title,
     description,
     graphic,
     fade = [],
   }: {
      dark?: boolean;
      className?: string;
      eyebrow: React.ReactNode;
      title: React.ReactNode;
      description: React.ReactNode;
      graphic?: React.ReactNode;
      fade?: ("top" | "bottom")[];
    }) {
        return (
          <motion.div
            initial="idle"
            whileHover="active"
            variants={{ idle: {}, active: {} }}
            data-dark={dark ? "true" : undefined}
            className={clsx(
              className,
              "group relative flex flex-col overflow-hidden rounded-lg",
              "bg-transparent transform-gpu dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#8686f01f_inset]   shadow-sm ring-1 ring-black/5",
              "data-[dark]:bg-gray-800 data-[dark]:ring-white/15"
            )}
          >
            <div className="relative h-[29rem] shrink-0">
              {graphic}
              {fade.includes("top") && (
                <div className="absolute inset-0 bg-gradient-to-b from-white to-50% group-data-[dark]:from-gray-800 group-data-[dark]:from-[-25%] opacity-25" />
              )}
              {fade.includes("bottom") && (
                <div className="absolute inset-0 bg-gradient-to-t from-white to-50% group-data-[dark]:from-gray-800 group-data-[dark]:from-[-25%] opacity-25" />
              )}
            </div>
            <div className="relative p-10  z-20 isolate mt-[-110px] h-[14rem] backdrop-blur-xl">
              <h1>{eyebrow}</h1>
              <p className="mt-1 text-2xl/8 font-medium tracking-tight dark:text-gray-100 text-gray-950 group-data-[dark]:text-white">
                {title}
              </p>
              <p className="mt-2 max-w-[600px] text-sm/6 text-gray-600 dark:text-gray-300 group-data-[dark]:text-gray-400">
                {description}
              </p>
            </div>
          </motion.div>
        );
      }
      