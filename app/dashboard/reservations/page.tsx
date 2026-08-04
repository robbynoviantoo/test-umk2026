'use client';

import { useEffect, useState } from 'react';
import {
  CalendarDays,
  Clock,
  Search,
  Plus,
  Check,
  X,
  AlertTriangle,
  FileText,
  User,
  CheckCircle2,
  XCircle,
  Trash2,
  Info,
} from 'lucide-react';

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('semua');
  const [selectedDate, setSelectedDate] = useState('');
  const [mineOnly, setMineOnly] = useState(true);

  // New Request Modal
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestForm, setRequestForm] = useState({
    roomId: '',
    tanggal: new Date().toISOString().split('T')[0],
    jamMulai: '08:00',
    jamSelesai: '10:00',
    keperluan: '',
  });
  const [requestError, setRequestError] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);

  // Admin Approval Modal
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<any>(null);
  const [catatanAdmin, setCatatanAdmin] = useState('');
  const [approvalError, setApprovalError] = useState('');
  const [processingApproval, setProcessingApproval] = useState(false);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (err) {
      console.error('Fetch user error:', err);
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/rooms?status=Tersedia');
      if (res.ok) {
        const data = await res.json();
        setRooms(data.rooms);
        if (data.rooms.length > 0 && !requestForm.roomId) {
          setRequestForm((prev) => ({ ...prev, roomId: data.rooms[0].id }));
        }
      }
    } catch (err) {
      console.error('Fetch rooms error:', err);
    }
  };

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedStatus !== 'semua') params.append('status', selectedStatus);
      if (selectedDate) params.append('tanggal', selectedDate);
      if (user?.role === 'DOSEN' && mineOnly) params.append('mineOnly', 'true');

      const res = await fetch(`/api/reservations?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setReservations(data.reservations);
      }
    } catch (err) {
      console.error('Fetch reservations error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchRooms();
  }, []);

  useEffect(() => {
    if (user) {
      fetchReservations();
    }
  }, [user, search, selectedStatus, selectedDate, mineOnly]);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingRequest(true);
    setRequestError('');

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setRequestModalOpen(false);
      setRequestForm({
        roomId: rooms[0]?.id || '',
        tanggal: new Date().toISOString().split('T')[0],
        jamMulai: '08:00',
        jamSelesai: '10:00',
        keperluan: '',
      });
      fetchReservations();
    } catch (err: any) {
      setRequestError(err.message);
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleOpenApprovalModal = (res: any) => {
    setSelectedReservation(res);
    setCatatanAdmin('');
    setApprovalError('');
    setApprovalModalOpen(true);
  };

  const handleProcessApproval = async (action: 'APPROVE' | 'REJECT') => {
    if (!selectedReservation) return;
    setProcessingApproval(true);
    setApprovalError('');

    try {
      const res = await fetch(`/api/reservations/${selectedReservation.id}/approval`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, catatanAdmin }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setApprovalModalOpen(false);
      fetchReservations();
    } catch (err: any) {
      setApprovalError(err.message);
    } finally {
      setProcessingApproval(false);
    }
  };

  const handleDeleteReservation = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin membatalkan pengajuan ini?')) return;
    try {
      const res = await fetch(`/api/reservations/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchReservations();
    } catch (err: any) {
      alert(`Gagal menghapus: ${err.message}`);
    }
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="space-y-6">
      {/* Header & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <CalendarDays className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            Manajemen Peminjaman Ruangan
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs mt-1 font-medium">
            Pengajuan peminjaman ruangan perkuliahan, persetujuan admin, dan validasi bentrok jadwal.
          </p>
        </div>

        <button
          onClick={() => {
            setRequestError('');
            setRequestModalOpen(true);
          }}
          className="gradient-btn px-5 py-2.5 rounded-xl text-white font-bold text-xs flex items-center gap-2 shadow-lg self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Buat Pengajuan Peminjaman
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-card rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4 shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari peminjam, keperluan, atau ruangan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 font-medium"
          />
        </div>

        {/* Date Filter */}
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500 font-medium"
        />

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500 font-medium"
        >
          <option value="semua">Semua Status</option>
          <option value="Menunggu">Menunggu Approval</option>
          <option value="Disetujui">Disetujui</option>
          <option value="Ditolak">Ditolak</option>
          <option value="Selesai">Selesai</option>
        </select>

        {/* Dosen Scope Toggle */}
        {!isAdmin && (
          <button
            type="button"
            onClick={() => setMineOnly(!mineOnly)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
              mineOnly
                ? 'bg-blue-100 dark:bg-blue-600/20 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-500/40'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border-slate-300 dark:border-slate-700'
            }`}
          >
            {mineOnly ? 'Peminjaman Saya' : 'Semua Jadwal Disetujui'}
          </button>
        )}
      </div>

      {/* Reservations List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : reservations.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <FileText className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-300">Tidak Ada Data Peminjaman</h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">Belum ada peminjaman ruangan yang cocok dengan filter Anda.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.map((res) => (
            <div
              key={res.id}
              className="glass-card rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
            >
              {/* Info Column */}
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-700 dark:text-blue-400 px-2.5 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
                    {res.room?.kodeRuang}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{res.room?.namaRuangan}</h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">({res.room?.namaGedung})</span>
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-slate-600 dark:text-slate-400 font-medium">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    <span>Peminjam: <strong className="text-slate-900 dark:text-slate-200 font-bold">{res.user?.name}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono">
                    <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>{res.tanggal} • <strong className="text-blue-700 dark:text-blue-300 font-bold">{res.jamMulai} - {res.jamSelesai}</strong></span>
                  </div>
                </div>

                <p className="text-xs text-slate-800 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 font-medium">
                  <strong className="text-slate-600 dark:text-slate-400 font-bold">Keperluan:</strong> {res.keperluan}
                </p>

                {res.catatanAdmin && (
                  <p className="text-[11px] text-amber-900 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 p-2.5 rounded-lg border border-amber-200 dark:border-amber-500/20 flex items-start gap-1.5 font-medium">
                    <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span><strong className="font-bold">Catatan Admin:</strong> {res.catatanAdmin}</span>
                  </p>
                )}
              </div>

              {/* Status & Actions Column */}
              <div className="flex items-center justify-between md:flex-col md:items-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-200 dark:border-slate-800">
                <span
                  className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase flex items-center gap-1.5 ${
                    res.status === 'Disetujui'
                      ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30'
                      : res.status === 'Menunggu'
                      ? 'bg-amber-100 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30'
                      : res.status === 'Ditolak'
                      ? 'bg-rose-100 dark:bg-rose-500/15 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-500/30'
                      : 'bg-slate-100 dark:bg-slate-500/15 text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-500/30'
                  }`}
                >
                  {res.status === 'Disetujui' && <CheckCircle2 className="w-4 h-4" />}
                  {res.status === 'Menunggu' && <Clock className="w-4 h-4" />}
                  {res.status === 'Ditolak' && <XCircle className="w-4 h-4" />}
                  {res.status}
                </span>

                <div className="flex items-center gap-2">
                  {isAdmin && res.status === 'Menunggu' && (
                    <button
                      onClick={() => handleOpenApprovalModal(res)}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Review & Process
                    </button>
                  )}

                  {(isAdmin || res.userId === user?.id) && (
                    <button
                      onClick={() => handleDeleteReservation(res.id)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-300 transition-colors"
                      title="Batalkan / Hapus Pengajuan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal New Request */}
      {requestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm">
          <div className="glass-card w-full max-w-lg rounded-3xl p-6 shadow-2xl relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Form Pengajuan Peminjaman Ruangan
              </h3>
              <button
                onClick={() => setRequestModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {requestError && (
              <div className="mt-4 p-3.5 rounded-xl bg-rose-100 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2 font-semibold">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{requestError}</span>
              </div>
            )}

            <form onSubmit={handleCreateRequest} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Pilih Ruangan</label>
                <select
                  value={requestForm.roomId}
                  onChange={(e) => setRequestForm({ ...requestForm, roomId: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      [{r.kodeRuang}] {r.namaRuangan} - {r.namaGedung} (Kapasitas: {r.kapasitasRuang} orang)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Tanggal Peminjaman</label>
                <input
                  type="date"
                  required
                  value={requestForm.tanggal}
                  onChange={(e) => setRequestForm({ ...requestForm, tanggal: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Jam Mulai</label>
                  <input
                    type="time"
                    required
                    value={requestForm.jamMulai}
                    onChange={(e) => setRequestForm({ ...requestForm, jamMulai: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Jam Selesai</label>
                  <input
                    type="time"
                    required
                    value={requestForm.jamSelesai}
                    onChange={(e) => setRequestForm({ ...requestForm, jamSelesai: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Keperluan / Nama Kegiatan</label>
                <textarea
                  required
                  rows={3}
                  value={requestForm.keperluan}
                  onChange={(e) => setRequestForm({ ...requestForm, keperluan: e.target.value })}
                  placeholder="Contoh: Kuliah Praktikum Pemrograman Web - Kelas A (2 SKS)"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRequestModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingRequest}
                  className="gradient-btn px-5 py-2 rounded-xl text-white font-bold flex items-center gap-2 shadow-md"
                >
                  {submittingRequest ? 'Kirim...' : 'Kirim Pengajuan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Admin Review & Approval */}
      {approvalModalOpen && selectedReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md rounded-3xl p-6 shadow-2xl relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Review Pengajuan Peminjaman</h3>
              <button
                onClick={() => setApprovalModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {approvalError && (
              <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2 font-semibold">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{approvalError}</span>
              </div>
            )}

            <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-2">
              <div className="font-bold text-blue-700 dark:text-blue-400">
                [{selectedReservation.room?.kodeRuang}] {selectedReservation.room?.namaRuangan}
              </div>
              <div className="text-slate-800 dark:text-slate-300">Peminjam: <strong>{selectedReservation.user?.name}</strong></div>
              <div className="text-slate-600 dark:text-slate-400">Jadwal: {selectedReservation.tanggal} ({selectedReservation.jamMulai} - {selectedReservation.jamSelesai})</div>
              <div className="text-slate-900 dark:text-slate-200 font-mono bg-white dark:bg-slate-900 p-2.5 rounded-md border border-slate-200 dark:border-slate-800 font-medium">
                Keperluan: {selectedReservation.keperluan}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Catatan / Alasan Admin (Opsional)
              </label>
              <textarea
                rows={2}
                value={catatanAdmin}
                onChange={(e) => setCatatanAdmin(e.target.value)}
                placeholder="Contoh: Disetujui untuk kegiatan perkuliahan semester ganjil."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={processingApproval}
                onClick={() => handleProcessApproval('REJECT')}
                className="py-2.5 px-4 rounded-xl bg-rose-100 dark:bg-rose-600/20 hover:bg-rose-200 dark:hover:bg-rose-600/30 border border-rose-300 dark:border-rose-500/40 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <XCircle className="w-4 h-4" />
                Tolak Pengajuan
              </button>
              <button
                type="button"
                disabled={processingApproval}
                onClick={() => handleProcessApproval('APPROVE')}
                className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                Setujui (Approve)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
