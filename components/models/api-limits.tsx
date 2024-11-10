"use client";

import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';

interface ApiCallStats {
  api_calls_remaining: number;
  total_calls: number;
  user_email: string;
  status: string;
}

const COLORS = ['#4F46E5', '#10B981'];

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
  const pieData = [
    { name: 'Utilisés', value: usedCalls },
    { name: 'Restants', value: stats.api_calls_remaining }
  ];

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 flex items-center justify-center py-8">
        <div className="flex flex-col h-[600px] max-h-[80vh] w-full max-w-4xl">
          <div className="flex-none px-6 py-4 border-b rounded-t-xl bg-white">
            <h1 className="text-xl font-semibold text-gray-900">Utilisation de l'API</h1>
            <p className="text-sm text-gray-500">Suivez votre consommation d'appels API en temps réel</p>
          </div>

          <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-500">Appels restants</h3>
                  <div className="p-2 bg-green-50 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {stats.api_calls_remaining}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  sur 1000 appels totaux
                </p>
              </Card>

              <Card className="p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-500">Appels utilisés</h3>
                  <div className="p-2 bg-blue-50 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {usedCalls}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {((usedCalls / 1000) * 100).toFixed(1)}% utilisés
                </p>
              </Card>

              <Card className="p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-500">Limite quotidienne</h3>
                  <div className="p-2 bg-gray-50 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-gray-500" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 mt-2">1000</p>
                <p className="text-sm text-gray-400 mt-1">
                  Réinitialisation quotidienne
                </p>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Card className="p-6 bg-white shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Répartition des appels</h2>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="p-6 bg-white shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Historique d'utilisation</h2>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: "Aujourd'hui", utilisés: usedCalls, restants: stats.api_calls_remaining }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="utilisés" stackId="a" fill="#4F46E5" name="Appels utilisés" />
                      <Bar dataKey="restants" stackId="a" fill="#10B981" name="Appels restants" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 