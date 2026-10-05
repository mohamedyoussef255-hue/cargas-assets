import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Edit3,
  ExternalLink,
  Filter,
  Fuel,
  Mail,
  MessageCircle,
  Pencil,
  Phone,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  X
} from 'lucide-react';
import { useCargas } from '../../context/CargasContext';
import { CargasUser, UserRole } from '../../types/cargas';
import { WhatsAppInviteModal } from './WhatsAppInviteModal';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface UsersTabProps {
  onTestInvite?: (token: string) => void;
}

export const UsersTab: React.FC<UsersTabProps> = ({ onTestInvite }) => {
  const { users, stations, addUser, updateUser, deleteUser, currentUser } = useCargas();

  const [isAdding, setIsAdding] = useState(false);
  const [userToDelete, setUserToDelete] = useState<CargasUser | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('station_manager');
  const [stationId, setStationId] = useState(stations[0]?.id || '');
  
  // Edit user state
  const [editingUser, setEditingUser] = useState<CargasUser | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('station_manager');
  const [editStationId, setEditStationId] = useState('');
  const [editStatus, setEditStatus] = useState<'active' | 'invited' | 'pending'>('pending');

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'invited' | 'pending'>('all');

  // WhatsApp Invite Modal state
  const [inviteModalUser, setInviteModalUser] = useState<CargasUser | null>(null);

  // Stats
  const activeCount = users.filter(u => u.status === 'active').length;
  const invitedCount = users.filter(u => u.status === 'invited').length;
  const pendingCount = users.filter(u => !u.status || u.status === 'pending').length;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const matchedStation = stations.find(s => s.id === stationId);

    const newUser = addUser({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      whatsapp_number: phone.trim(),
      role,
      station_id: role === 'station_manager' ? stationId : undefined,
      station_name: role === 'station_manager' ? matchedStation?.name : undefined,
      region: role === 'station_manager' ? matchedStation?.region : undefined,
      status: 'pending',
      auth_provider: 'google'
    });

    setIsAdding(false);
    setName('');
    setEmail('');
    setPhone('');

    // Automatically prompt WhatsApp invite for newly created station manager
    setInviteModalUser(newUser);
  };

  const openEditUser = (u: CargasUser) => {
    setEditingUser(u);
    setEditName(u.name);
    setEditEmail(u.email);
    setEditPhone(u.whatsapp_number || u.phone || '');
    setEditRole(u.role);
    setEditStationId(u.station_id || stations[0]?.id || '');
    setEditStatus(u.status || 'pending');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editName.trim() || !editEmail.trim()) return;

    const matchedStation = stations.find(s => s.id === editStationId);

    updateUser(editingUser.id, {
      name: editName.trim(),
      email: editEmail.trim(),
      phone: editPhone.trim(),
      whatsapp_number: editPhone.trim(),
      role: editRole,
      station_id: editRole === 'station_manager' ? editStationId : undefined,
      station_name: editRole === 'station_manager' ? matchedStation?.name : undefined,
      region: editRole === 'station_manager' ? matchedStation?.region : undefined,
      status: editStatus
    });

    setEditingUser(null);
  };

  // Filtered users list
  const filteredUsers = users.filter(u => {
    const q = searchQuery.toLowerCase().trim();
    const matchQuery = !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone && u.phone.includes(q)) ||
      (u.whatsapp_number && u.whatsapp_number.includes(q)) ||
      (u.station_name && u.station_name.toLowerCase().includes(q));

    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchStatus = statusFilter === 'all' || (u.status || 'pending') === statusFilter;

    return matchQuery && matchRole && matchStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner & KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-2xl font-extrabold text-slate-900">{users.length}</p>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">إجمالي المستخدمين</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-2xl font-extrabold text-emerald-700">{activeCount}</p>
            <p className="text-xs text-emerald-800 font-semibold mt-0.5">نشط بحساب Google</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/60 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-2xl font-extrabold text-blue-700">{invitedCount}</p>
            <p className="text-xs text-blue-800 font-semibold mt-0.5">دعوات واتساب مرسلة</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
            <MessageCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-2xl font-extrabold text-amber-700">{pendingCount}</p>
            <p className="text-xs text-amber-800 font-semibold mt-0.5">بانتظار إرسال الدعوة</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Header & Controls Bar */}
      <div className="flex flex-col gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">التحكم في صفحة المستخدمين ودعوات WhatsApp</h2>
            <p className="text-xs text-slate-500">
              تسجيل حسابات Google المعتمدة، تخصيص المحطات، وإرسال روابط الدخول المباشرة عبر واتساب
            </p>
          </div>

          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-all shadow-xs"
            id="btn-add-new-user"
          >
            <UserPlus className="w-4 h-4" />
            <span>إضافة مستخدم جديد</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث بالاسم، بريد Gmail، رقم الهاتف، أو اسم المحطة..."
              className="w-full pl-3 pr-9 py-2 rounded-xl text-xs border border-slate-200 focus:outline-none focus:border-emerald-600 bg-slate-50 focus:bg-white transition-colors"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter by Role */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-400 font-semibold">الدور:</span>
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                roleFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setRoleFilter('admin')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                roleFilter === 'admin' ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              مدير نظام
            </button>
            <button
              onClick={() => setRoleFilter('station_manager')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                roleFilter === 'station_manager' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              مدير محطة
            </button>
          </div>

          {/* Filter by Status */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-400 font-semibold">الحالة:</span>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                statusFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                statusFilter === 'active' ? 'bg-green-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              نشط
            </button>
            <button
              onClick={() => setStatusFilter('invited')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                statusFilter === 'invited' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              تمت الدعوة
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                statusFilter === 'pending' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              بانتظار
            </button>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      {filteredUsers.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs">
          <UserCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-700">لا يوجد مستخدمون يطابقون شروط البحث</p>
          <p className="text-xs text-slate-400 mt-1">جرب تغيير كلمات البحث أو إعادة ضبط خيارات التصفية</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map(u => {
            const isMe = u.id === currentUser.id;
            const status = u.status || 'pending';

            return (
              <div
                key={u.id}
                className={`p-5 rounded-2xl bg-white border transition-all shadow-xs flex flex-col justify-between ${
                  isMe ? 'border-emerald-600 ring-2 ring-emerald-600/15' : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Header row: Role + Status Badge + Edit */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        u.role === 'admin' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {u.role === 'admin' ? <ShieldCheck className="w-5 h-5" /> : <Fuel className="w-5 h-5" />}
                      </span>

                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        u.role === 'admin' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {u.role === 'admin' ? 'مدير نظام' : 'مدير محطة'}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : status === 'invited'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {status === 'active' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                      {status === 'invited' && <MessageCircle className="w-3 h-3 text-blue-600" />}
                      {status === 'pending' && <Clock className="w-3 h-3 text-slate-400" />}
                      <span>
                        {status === 'active'
                          ? 'نشط (Google)'
                          : status === 'invited'
                          ? 'تمت الدعوة'
                          : 'بانتظار الدعوة'}
                      </span>
                    </span>
                  </div>

                  {/* User Name & Gmail */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{u.name}</h3>
                    {isMe && (
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded">
                        حسابك الحالي
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-600 font-mono" dir="ltr">
                    {/* Google colored G icon */}
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span className="truncate">{u.email}</span>
                  </div>

                  {/* WhatsApp Phone */}
                  {(u.whatsapp_number || u.phone) && (
                    <p className="mt-1 text-xs text-slate-500 flex items-center gap-1.5 font-mono">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span dir="ltr">{u.whatsapp_number || u.phone}</span>
                    </p>
                  )}

                  {/* Station Info */}
                  {u.station_name && (
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-50 text-xs text-slate-600 flex items-center justify-between border border-slate-100">
                      <span className="text-[11px] text-slate-400">المحطة المسندة:</span>
                      <span className="font-bold text-slate-800">{u.station_name}</span>
                    </div>
                  )}

                  {u.invite_date && status === 'invited' && (
                    <p className="mt-2 text-[10px] text-blue-600 font-medium">
                      تم إرسال الدعوة بتاريخ: {u.invite_date}
                    </p>
                  )}
                </div>

                {/* Action Buttons Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  
                  {/* Send WhatsApp Invite Button */}
                  <button
                    type="button"
                    onClick={() => setInviteModalUser(u)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-2xs"
                    title="إرسال رابط الدعوة والتفعيل عبر واتساب"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{status === 'invited' ? 'إعادة إرسال واتساب' : 'دعوة عبر واتساب'}</span>
                  </button>

                  {/* Edit User Button */}
                  <button
                    onClick={() => openEditUser(u)}
                    className="p-1.5 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-slate-100 transition-colors"
                    title="تعديل بيانات وصلاحية المستخدم"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  {/* Delete Button (disabled for current logged-in user) */}
                  {!isMe && users.length > 1 && (
                    <button
                      onClick={() => setUserToDelete(u)}
                      className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors"
                      title="حذف المستخدم"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 text-right">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Pencil className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-sm text-slate-900">تعديل بيانات المستخدم وصلاحياته</h3>
              </div>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم المستخدم *</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">بريد Google المعتمد (Gmail) *</label>
                <div className="relative">
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 rounded-xl text-xs font-mono border border-slate-300 focus:outline-none focus:border-emerald-600 text-left"
                    dir="ltr"
                    required
                  />
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رقم هاتف الواتساب (WhatsApp)</label>
                <div className="relative">
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="01012345671"
                    className="w-full pl-3 pr-8 py-2 rounded-xl text-xs font-mono border border-slate-300 focus:outline-none focus:border-emerald-600 text-left"
                    dir="ltr"
                  />
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الدور والصلاحية *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditRole('admin')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                      editRole === 'admin' ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    مدير النظام (Admin)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditRole('station_manager')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                      editRole === 'station_manager' ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    مدير محطة
                  </button>
                </div>
              </div>

              {editRole === 'station_manager' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المحطة المسندة *</label>
                  <select
                    value={editStationId}
                    onChange={(e) => setEditStationId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 focus:outline-none focus:border-emerald-600"
                  >
                    {stations.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.region})</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">حالة الحساب</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 focus:outline-none focus:border-emerald-600"
                >
                  <option value="active">نشط (تم تسجيل الدخول)</option>
                  <option value="invited">تم إرسال دعوة واتساب</option>
                  <option value="pending">بانتظار إرسال الدعوة</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-xs"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 text-right">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-sm text-slate-900">إضافة مستخدم جديد وإرسال دعوة</h3>
              </div>
              <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم المهندس / المستخدم *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: م. أحمد عبد الفتاح"
                  className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">بريد Google المعتمد (Gmail) *</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@gmail.com"
                    className="w-full pl-3 pr-8 py-2 rounded-xl text-xs font-mono border border-slate-300 focus:outline-none focus:border-emerald-600 text-left"
                    dir="ltr"
                    required
                  />
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  سيستخدم هذا البريد لتسجيل الدخول المباشر عبر Google
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رقم هاتف الواتساب (WhatsApp) *</label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01012345671"
                    className="w-full pl-3 pr-8 py-2 rounded-xl text-xs font-mono border border-slate-300 focus:outline-none focus:border-emerald-600 text-left"
                    dir="ltr"
                    required
                  />
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">نوع الصلاحية *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                      role === 'admin' ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    مدير النظام (Admin)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('station_manager')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                      role === 'station_manager' ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    مدير محطة
                  </button>
                </div>
              </div>

              {role === 'station_manager' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المحطة التابع لها *</label>
                  <select
                    value={stationId}
                    onChange={(e) => setStationId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 focus:outline-none focus:border-emerald-600"
                  >
                    {stations.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.region})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-xs"
                >
                  حفظ وتجهيز دعوة واتساب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WhatsApp Invite Modal */}
      {inviteModalUser && (
        <WhatsAppInviteModal
          user={inviteModalUser}
          isOpen={true}
          onClose={() => setInviteModalUser(null)}
          onTestInvite={onTestInvite}
        />
      )}

      {/* User Deletion Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={() => {
          if (userToDelete) {
            deleteUser(userToDelete.id);
            setUserToDelete(null);
          }
        }}
        type="danger"
        title="تأكيد حذف حساب المستخدم"
        message={`هل أنت متأكد من رغبتك في حذف حساب المستخدم "${userToDelete?.name}" نهائياً من المنظومة؟ لن يتمكن من تسجيل الدخول بعد ذلك.`}
        confirmLabel="تأكيد حذف المستخدم"
        cancelLabel="تراجع"
        itemDetails={userToDelete ? [
          { label: 'الاسم', value: userToDelete.name },
          { label: 'البريد الإلكتروني', value: userToDelete.email },
          { label: 'الدور والوظيفة', value: userToDelete.role === 'admin' ? 'مدير نظام عام' : 'مسؤول محطة' },
          { label: 'المحطة المسندة', value: userToDelete.station_name || 'غير محدد' }
        ] : []}
      />

    </div>
  );
};

