'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  DoorOpen,
  CalendarDays,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  PlusCircle,
  ArrowUpRight,
} from 'lucide-react';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [recentReservations, setRecentReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [userRes, statsRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/dashboard/stats'),
      ]);

      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData.user);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
        setRecentReservations(statsData.recentReservations);
      }
    } catch (err) {
      console.error('Failed loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSyncRuangan = async () => {
    setSyncing(true);
    setSyncMessage('');
    try {
      const res = await fetch('/api/rooms/sync', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSyncMessage(`Sukses! ${data.result.totalSynced} ruangan tersinkronisasi.`);
      await loadData();
    } catch (err: any) {
      setSyncMessage(`Gagal: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 relative overflow-hidden bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-lg">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 text-xs font-semibold mb-3">
              <span>{isAdmin ? 'Mode Administrator' : 'Mode Dosen'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Selamat Datang, <span className="gradient-text">{user?.name}</span>!
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 max-w-2xl">
              {isAdmin
                ? 'Kelola data ruangan, persetujuan peminjaman, dan verifikasi ketersediaan jadwal kampus.'
                : 'Ajukan peminjaman ruangan perkuliahan & kegiatan dengan sistem verifikasi bebas bentrok jadwal.'}
            </p>
          </div>

          {/* Quick Primary Action Button */}
          <div className="flex flex-wrap items-center gap-3">
            {isAdmin ? (
              <button
                onClick={handleSyncRuangan}
                disabled={syncing}
                className="gradient-btn px-4 py-3 rounded-2xl text-white font-semibold text-xs flex items-center gap-2 shadow-lg disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Menyingkronkan...' : 'Sync Data Ruangan'}
              </button>
            ) : (
              <Link
                href="/dashboard/reservations"
                className="gradient-btn px-5 py-3 rounded-2xl text-white font-semibold text-xs flex items-center gap-2 shadow-lg"
              >
                <PlusCircle className="w-4 h-4" />
                Ajukan Peminjaman Baru
              </Link>
            )}
          </div>
        </div>

        {syncMessage && (
          <div className="mt-4 p-3 rounded-xl bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 text-blue-800 dark:text-blue-300 text-xs flex items-center justify-between">
            <span>{syncMessage}</span>
            <button onClick={() => setSyncMessage('')} className="hover:text-black dark:hover:text-white font-bold">×</button>
          </div>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="glass-card rounded-2xl p-5 bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Ruangan</span>
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <DoorOpen className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-3">{stats?.totalRooms || 0}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{stats?.availableRooms || 0} Ruangan Siap Pakai</p>
        </div>

        <div className="glass-card rounded-2xl p-5 bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Menunggu Approval</span>
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400 mt-3">{stats?.pendingCount || 0}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Pengajuan Perlu Review</p>
        </div>

        <div className="glass-card rounded-2xl p-5 bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Disetujui</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-3">{stats?.approvedCount || 0}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Jadwal Terverifikasi</p>
        </div>

        <div className="glass-card rounded-2xl p-5 bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ditolak / Selesai</span>
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-700 dark:text-slate-300 mt-3">
            {(stats?.rejectedCount || 0) + (stats?.completedCount || 0)}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{stats?.rejectedCount || 0} Ditolak • {stats?.completedCount || 0} Selesai</p>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Reservations Table (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Aktivitas Peminjaman Terbaru
            </h2>
            <Link
              href="/dashboard/reservations"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              Lihat Semua
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="glass-card rounded-2xl overflow-hidden bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
            {recentReservations.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                Belum ada aktivitas peminjaman ruangan.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Ruangan</th>
                      <th className="py-3 px-4">Peminjam</th>
                      <th className="py-3 px-4">Tanggal & Jam</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                    {recentReservations.map((res: any) => (
                      <tr key={res.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                          <div>{res.room?.namaRuangan}</div>
                          <span className="text-[10px] text-slate-500 font-mono">{res.room?.kodeRuang}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-900 dark:text-slate-200">{res.user?.name}</div>
                          <div className="text-[10px] text-slate-500">{res.user?.email}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          <div>{res.tanggal}</div>
                          <div className="text-[11px] text-blue-600 dark:text-blue-400">{res.jamMulai} - {res.jamSelesai}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                              res.status === 'Disetujui'
                                ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                                : res.status === 'Menunggu'
                                ? 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30'
                                : res.status === 'Ditolak'
                                ? 'bg-rose-100 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30'
                                : 'bg-slate-100 dark:bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-500/30'
                            }`}
                          >
                            {res.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Gedung Breakdown Cards (1 Col) */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Distribusi Gedung
          </h2>

          <div className="glass-card rounded-2xl p-5 bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3">
            {stats?.buildingCounts && Object.keys(stats.buildingCounts).length > 0 ? (
              Object.entries(stats.buildingCounts).map(([gedung, count]: [string, any]) => (
                <div key={gedung} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{gedung}</span>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
                    {count} Ruangan
                  </span>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-xs">Belum ada data gedung.</p>
            )}

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <Link
                href="/dashboard/rooms"
                className="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
              >
                Lihat Katalog Ruangan Lengkap
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
