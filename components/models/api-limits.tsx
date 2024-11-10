"use client";

import React, { useEffect, useState } from 'react';
import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import { Loader2, AlertCircle } from 'lucide-react';

interface ApiCallStats {
  api_calls_remaining: number;
  total_calls: number;
  user_email: string;
  status: string;
}

export function ApiLimits() {
  const [stats, setStats] = useState<ApiCallStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const response = await fetch('https://appai.charlesagostinelli.com/api/apiCall/', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (!response.ok) throw new Error('Erreur lors de la récupération des statistiques');
        
        const data = await response.json();
        setStats(data);
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
  const chartData = [
    {
      période: "Aujourd'hui",
      utilisés: usedCalls,
      restants: stats.api_calls_remaining
    }
  ];

  return (
    <div className="flex flex-col h-full w-full p-6">
      <div className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-4 bg-white shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Appels restants</h3>
            <div className="mt-2">
              <div className="text-3xl font-bold text-green-600">
                {stats.api_calls_remaining}
              </div>
              <p className="text-sm text-gray-400 mt-1">
                sur 1000 appels totaux
              </p>
            </div>
          </Card>

          <Card className="p-4 bg-white shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Appels utilisés</h3>
            <div className="mt-2">
              <div className="text-3xl font-bold text-blue-600">
                {usedCalls}
              </div>
              <p className="text-sm text-gray-400 mt-1">
                {((usedCalls / 1000) * 100).toFixed(1)}% utilisés
              </p>
            </div>
          </Card>

          <Card className="p-4 bg-white shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Limite quotidienne</h3>
            <div className="mt-2">
              <div className="text-3xl font-bold">
                1000
              </div>
              <p className="text-sm text-gray-400 mt-1">
                Réinitialisation quotidienne
              </p>
            </div>
          </Card>
        </div>

        <Card className="p-4 bg-white shadow-sm">
          <div>
            <h3 className="text-base font-medium">Utilisation des appels API</h3>
            <p className="text-sm text-gray-500">Répartition des appels utilisés et restants</p>
          </div>
          
          <div className="h-[200px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barSize={20}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  vertical={false}
                  stroke="#E5E7EB"
                />
                <XAxis
                  dataKey="période"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value, name) => {
                    return [`${value}`, name === 'utilisés' ? 'utilisés' : 'restants']
                  }}
                  labelStyle={{
                    color: '#6B7280',
                    fontSize: '12px'
                  }}
                />
                <Bar 
                  dataKey="utilisés" 
                  fill="#4F46E5" 
                  radius={[2, 2, 0, 0]}
                  stackId="a"
                />
                <Bar 
                  dataKey="restants" 
                  fill="#10B981" 
                  radius={[2, 2, 0, 0]}
                  stackId="a"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <span>{stats.api_calls_remaining} appels API disponibles</span>
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-gray-500 text-xs">
              Limite quotidienne de 1000 appels
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 