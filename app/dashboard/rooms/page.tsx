'use client';

import { useEffect, useState } from 'react';
import {
  DoorOpen,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Building,
  Users,
  CheckCircle,
  AlertTriangle,
  X,
  Link2,
} from 'lucide-react';

export default function RoomsPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedGedung, setSelectedGedung] = useState('semua');
  const [selectedJenis, setSelectedJenis] = useState('semua');
  const [selectedStatus, setSelectedStatus] = useState('semua');

  // Sync state
  const [syncing, setSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState('');

  // Modal State (Create / Edit)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [formData, setFormData] = useState({
    kodeRuang: '',
    namaRuangan: '',
    namaGedung: 'Gedung A',
    kapasitasRuang: 40,
    jenisRuang: 'kelas',
    status: 'Tersedia',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedGedung !== 'semua') params.append('gedung', selectedGedung);
      if (selectedJenis !== 'semua') params.append('jenis', selectedJenis);
      if (selectedStatus !== 'semua') params.append('status', selectedStatus);

      const res = await fetch(`/api/rooms?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setRooms(data.rooms);
      }
    } catch (err) {
      console.error('Fetch rooms error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [search, selectedGedung, selectedJenis, selectedStatus]);

  const handleSyncWebService = async () => {
    setSyncing(true);
    setSyncNotice('');
    try {
      const res = await fetch('/api/rooms/sync', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSyncNotice(`Sinkronisasi WebService berhasil! (${data.result.createdCount} baru, ${data.result.updatedCount} diperbarui)`);
      fetchRooms();
    } catch (err: any) {
      setSyncNotice(`Gagal sync: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingRoom(null);
    setFormData({
      kodeRuang: '',
      namaRuangan: '',
      namaGedung: 'Gedung A',
      kapasitasRuang: 40,
      jenisRuang: 'kelas',
      status: 'Tersedia',
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (room: any) => {
    setEditingRoom(room);
    setFormData({
      kodeRuang: room.kodeRuang,
      namaRuangan: room.namaRuangan,
      namaGedung: room.namaGedung,
      kapasitasRuang: room.kapasitasRuang,
      jenisRuang: room.jenisRuang,
      status: room.status,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');

    try {
      const url = editingRoom ? `/api/rooms/${editingRoom.id}` : '/api/rooms';
      const method = editingRoom ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setModalOpen(false);
      fetchRooms();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRoom = async (roomId: string, kodeRuang: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus ruangan ${kodeRuang}?`)) return;

    try {
      const res = await fetch(`/api/rooms/${roomId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchRooms();
    } catch (err: any) {
      alert(`Gagal menghapus: ${err.message}`);
    }
  };

  const isAdmin = user?.role === 'ADMIN';
  const gedungs = Array.from(new Set(rooms.map((r) => r.namaGedung))).sort();

  return (
    <div className="space-y-6">
      {/* Header Title & Sync Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <DoorOpen className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            Katalog Data Ruangan
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs mt-1 font-medium">
            Daftar seluruh fasilitas ruangan kuliah, seminar, dan rapat di lingkungan kampus.
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleSyncWebService}
              disabled={syncing}
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50 shadow-sm"
              title="Sinkronisasi dari https://api-ruangan.vercel.app/rooms"
            >
              <RefreshCw className={`w-4 h-4 text-blue-600 dark:text-blue-400 ${syncing ? 'animate-spin' : ''}`} />
              Sync WebService
            </button>
            <button
              onClick={handleOpenCreateModal}
              className="gradient-btn px-4 py-2.5 rounded-xl text-white font-bold text-xs flex items-center gap-2 shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Tambah Ruangan
            </button>
          </div>
        )}
      </div>

      {syncNotice && (
        <div className="p-4 rounded-2xl bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 text-blue-800 dark:text-blue-300 text-xs flex items-center justify-between font-medium">
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 shrink-0" />
            <span>{syncNotice}</span>
          </div>
          <button onClick={() => setSyncNotice('')} className="hover:text-slate-900 dark:hover:text-white font-bold">×</button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="glass-card rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4 shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kode ruang, nama ruangan, atau gedung..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 font-medium"
          />
        </div>

        {/* Gedung Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedGedung}
            onChange={(e) => setSelectedGedung(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500 font-medium"
          >
            <option value="semua">Semua Gedung</option>
            {gedungs.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          {/* Jenis Filter */}
          <select
            value={selectedJenis}
            onChange={(e) => setSelectedJenis(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500 font-medium"
          >
            <option value="semua">Semua Jenis</option>
            <option value="kelas">Kelas</option>
            <option value="pertemuan">Pertemuan/Seminar</option>
            <option value="rapat">Rapat</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500 font-medium"
          >
            <option value="semua">Semua Status</option>
            <option value="Tersedia">Tersedia</option>
            <option value="Pemeliharaan">Pemeliharaan</option>
          </select>
        </div>
      </div>

      {/* Rooms Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : rooms.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <DoorOpen className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-300">Tidak Ada Ruangan Ditemukan</h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">Coba ubah kata kunci pencarian atau filter Anda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="glass-card rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-slate-700 transition-all flex flex-col justify-between group shadow-sm"
            >
              <div>
                {/* Header Card */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-blue-700 dark:text-blue-400 px-2.5 py-1 rounded-md bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
                      {room.kodeRuang}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-2.5 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                      {room.namaRuangan}
                    </h3>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 ${
                      room.status === 'Tersedia'
                        ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                        : 'bg-rose-100 dark:bg-rose-500/15 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30'
                    }`}
                  >
                    {room.status === 'Tersedia' ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <AlertTriangle className="w-3 h-3" />
                    )}
                    {room.status}
                  </span>
                </div>

                {/* Attributes */}
                <div className="space-y-2 my-4 text-xs text-slate-600 dark:text-slate-400 font-medium">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <span className="font-bold text-slate-800 dark:text-slate-300">{room.namaGedung}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <span>Kapasitas: <strong className="text-slate-900 dark:text-white font-extrabold">{room.kapasitasRuang}</strong> Orang</span>
                  </div>
                </div>
              </div>

              {/* Footer Details & Admin Controls */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-700 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                  Jenis: {room.jenisRuang}
                </span>

                {isAdmin && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(room)}
                      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                      title="Edit Ruangan"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteRoom(room.id, room.kodeRuang)}
                      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition-colors"
                      title="Hapus Ruangan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form Add/Edit Room */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm">
          <div className="glass-card w-full max-w-lg rounded-3xl p-6 shadow-2xl relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingRoom ? 'Edit Data Ruangan' : 'Tambah Ruangan Baru'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-100 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Kode Ruang</label>
                  <input
                    type="text"
                    required
                    value={formData.kodeRuang}
                    onChange={(e) => setFormData({ ...formData, kodeRuang: e.target.value })}
                    placeholder="e.g. GDA-101"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Kapasitas (Orang)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.kapasitasRuang}
                    onChange={(e) => setFormData({ ...formData, kapasitasRuang: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Nama Ruangan</label>
                <input
                  type="text"
                  required
                  value={formData.namaRuangan}
                  onChange={(e) => setFormData({ ...formData, namaRuangan: e.target.value })}
                  placeholder="e.g. Ruang Kuliah 101"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Nama Gedung</label>
                  <input
                    type="text"
                    required
                    value={formData.namaGedung}
                    onChange={(e) => setFormData({ ...formData, namaGedung: e.target.value })}
                    placeholder="e.g. Gedung A"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Jenis Ruangan</label>
                  <select
                    value={formData.jenisRuang}
                    onChange={(e) => setFormData({ ...formData, jenisRuang: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="kelas">Kelas</option>
                    <option value="pertemuan">Pertemuan / Seminar</option>
                    <option value="rapat">Rapat</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Status Operasional</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
                >
                  <option value="Tersedia">Tersedia</option>
                  <option value="Pemeliharaan">Pemeliharaan</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="gradient-btn px-5 py-2 rounded-xl text-white font-bold flex items-center gap-2 shadow-md"
                >
                  {submitting ? 'Menyimpan...' : editingRoom ? 'Simpan Perubahan' : 'Tambah Ruangan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
