"use client";

import React, { useEffect, useState } from 'react';
import { TrendingUp, AlertCircle, Loader2, Sparkles } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ApiCallStats {
  api_calls_remaining: number;
  total_calls: number;
  user_email: string;
  status: string;
}

interface ApiCallLogs {
  dates: string[];
  call_counts: number[];
}

export function ApiLimits() {
  const [stats, setStats] = useState<ApiCallStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [callLogs, setCallLogs] = useState<ApiCallLogs>({ dates: [], call_counts: [] });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        
        const [statsResponse, logsResponse] = await Promise.all([
          fetch('https://appai.charlesagostinelli.com/api/apiCall/', {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          }),
          fetch('https://appai.charlesagostinelli.com/api/api-call-logs/', {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          })
        ]);
        
        if (!statsResponse.ok || !logsResponse.ok) 
          throw new Error('Erreur lors de la récupération des données');
        
        const statsData = await statsResponse.json();
        const logsData = await logsResponse.json();

        const today = new Date().toISOString().split('T')[0];
        if (!logsData.dates.includes(today)) {
          logsData.dates.push(today);
          logsData.call_counts.push(1000 - statsData.api_calls_remaining);
        }
        
        setStats(statsData);
        setCallLogs(logsData);
        
        if (statsData.api_calls_remaining <= 5) {
          setShowUpgradeModal(true);
        }
      } catch (err) {
        setError('Impossible de charger les statistiques');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-theme(spacing.16))]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex h-[calc(100vh-theme(spacing.16))] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <p className="text-sm text-red-500">{error || 'Erreur de chargement des données'}</p>
        </div>
      </div>
    );
  }

  const usedCalls = 1000 - stats.api_calls_remaining;
  const chartData = callLogs.dates
    .map((date, index) => ({
      période: date === new Date().toISOString().split('T')[0] ? "Aujourd'hui" : new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit'
      }),
      utilisés: callLogs.call_counts[index],
      restants: 1000 - callLogs.call_counts[index],
      dateOriginal: date
    }))
    .sort((a, b) => {
      return new Date(a.dateOriginal).getTime() - new Date(b.dateOriginal).getTime();
    });

  return (
    <>
      <div className="flex flex-col h-full w-full p-6">
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total utilisé</p>
                  <p className="text-2xl font-bold">{1000 - (stats?.api_calls_remaining || 0)}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Limite quotidienne</p>
                  <p className="text-2xl font-bold">1000</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Sparkles className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pourcentage utilisé</p>
                  <p className="text-2xl font-bold">
                    {((1000 - (stats?.api_calls_remaining || 0)) / 1000 * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <AlertCircle className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-4 flex justify-center items-center">
              <div className="relative w-48 h-48">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    className="text-gray-100"
                    strokeWidth="12"
                    stroke="currentColor"
                    fill="transparent"
                    r="42"
                    cx="50"
                    cy="50"
                  />
                  <circle
                    className="text-indigo-500"
                    strokeWidth="12"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="42"
                    cx="50"
                    cy="50"
                    strokeDasharray={`${(stats?.api_calls_remaining || 0) / 10 * 2.639}, 264`}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                  <div className="text-3xl font-bold">{stats?.api_calls_remaining}</div>
                  <div className="text-sm text-gray-500">appels restants</div>
                  <div className="text-sm font-medium text-indigo-500">
                    {((stats?.api_calls_remaining || 0) / 1000 * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barSize={40}>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="période"
                      tickLine={false}
                      axisLine={false}
                      fontSize={12}
                      stroke="#94a3b8"
                    />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ 
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        border: 'none'
                      }}
                    />
                    <Bar 
                      dataKey="utilisés" 
                      fill="url(#gradientBar)"
                      radius={[6, 6, 0, 0]}
                    />
                    <defs>
                      <linearGradient id="gradientBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#818cf8" />
                        <stop offset="100%" stopColor="#6366f1" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-900">
          <DialogHeader className="space-y-4">
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-yellow-500" />
              <span className="text-2xl font-bold">Augmentez vos limites</span>
            </DialogTitle>
            <DialogDescription>
              <div className="space-y-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/50 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Vous avez presque atteint votre limite d'utilisation quotidienne !
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Le plan Pro inclut :</h4>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm">10 000 appels API par jour</span>
                    </li>
                    <li className="flex items-center gap-3 text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm">Support prioritaire 24/7</span>
                    </li>
                    <li className="flex items-center gap-3 text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm">Fonctionnalités avancées exclusives</span>
                    </li>
                    <li className="flex items-center gap-3 text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm">Tableau de bord personnalisé</span>
                    </li>
                  </ul>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col gap-2 sm:flex-col mt-6">
            <Button 
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              size="lg"
              onClick={() => window.location.href = '/pricing'}
            >
              Passer au Plan Pro
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setShowUpgradeModal(false)}
            >
              Continuer avec le plan gratuit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 