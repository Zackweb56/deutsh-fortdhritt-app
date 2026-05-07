import React, { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface AnalyticsStats {
  totalVisits: number;
  uniqueDevices: number;
  activeUsersCount: number;
}

const SimpleAnalytics = () => {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchStats = async () => {
    // Show mock data for local development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      setStats({
        totalVisits: 1,
        uniqueDevices: 1,
        activeUsersCount: 1
      });
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch('/api/analytics?secret=super-secret-analitics-2024');
      const data = await resp.json();
      if (data.ok) {
        setStats(data.stats);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch stats');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-10">
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-black uppercase italic">App <span className="text-[#ffcc00]">Stats</span></h1>
            {(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && (
              <span className="px-2 py-0.5 bg-[#ffcc00]/10 border border-[#ffcc00]/20 text-[#ffcc00] text-[8px] font-black uppercase tracking-widest rounded">Dev Mode</span>
            )}
          </div>
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-white/40 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </div>

        {error ? (
          <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-center">
            <p className="text-red-500 text-sm">{error}</p>
            <p className="text-white/30 text-[10px] mt-2">Note: API only works on production (Vercel)</p>
            <Button onClick={fetchStats} variant="link" className="text-[#ffcc00] mt-4">Try Again</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Live" value={stats?.activeUsersCount} color="text-emerald-500" />
            <StatCard label="Users" value={stats?.uniqueDevices} color="text-blue-500" />
            <StatCard label="Visits" value={stats?.totalVisits} color="text-[#ffcc00]" />
          </div>
        )}

        <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
          <p className="text-[10px] text-white/30 uppercase font-bold mb-2">How it works</p>
          <p className="text-xs text-white/50 leading-relaxed">
            Tracks unique devices and active sessions. Data is anonymous and updates automatically. 
            The API may not work in local development (404) but works perfectly on Vercel.
          </p>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, color }: { label: string, value?: number, color: string }) => (
  <div className="bg-[#111] p-8 rounded-3xl border border-white/5">
    <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">{label}</p>
    <p className={cn("text-4xl font-black", color)}>{value ?? '---'}</p>
  </div>
);

export default SimpleAnalytics;
