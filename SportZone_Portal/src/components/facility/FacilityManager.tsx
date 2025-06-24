import { CheckCircle, Edit3, Trash2, X } from 'lucide-react';
import React, { useState, type ChangeEvent, type FormEvent } from 'react';
import Swal from 'sweetalert2';
import Header from '../Header';
// Định nghĩa kiểu dữ liệu
type Facility = {
  id: number;
  u_id: string;
  open_time: string;
  close_time: string;
  address: string;
  description: string;
  subdescription?: string;
};

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: type,
    title: message,
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
  });
};

const FacilityManager: React.FC = () => {
  const [facilities, setFacilities] = useState<Facility[]>([
    {
      id: 1,
      u_id: 'U001',
      open_time: '08:00',
      close_time: '17:00',
      address: '123 Đường A, Hà Nội',
      description: 'Cơ sở chính',
      subdescription: 'Gần trung tâm'
    },
    {
      id: 2,
      u_id: 'U002',
      open_time: '09:00',
      close_time: '18:00',
      address: '456 Đường B, TP.HCM',
      description: 'Chi nhánh phía Nam',
      subdescription: 'Văn phòng tầng 2'
    }
  ]);

  const [searchKeyword, setSearchKeyword] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [formData, setFormData] = useState<Omit<Facility, 'id'>>({
    u_id: '',
    open_time: '',
    close_time: '',
    address: '',
    description: '',
    subdescription: ''
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!formData.u_id || !formData.open_time || !formData.close_time || !formData.address || !formData.description) {
      showToast('Vui lòng điền đầy đủ thông tin!', 'error');
      return;
    }

    if (editId !== null) {
      setFacilities(prev =>
        prev.map(item => (item.id === editId ? { ...item, ...formData } : item))
      );
      showToast('Cập nhật cơ sở thành công!');
    } else {
      const newFacility: Facility = {
        id: Date.now(),
        ...formData
      };
      setFacilities(prev => [...prev, newFacility]);
      showToast('Thêm cơ sở thành công!');
    }

    setFormData({
      u_id: '',
      open_time: '',
      close_time: '',
      address: '',
      description: '',
      subdescription: ''
    });
    setEditId(null);
    setShowPopup(false);
  };

  const handleEdit = (id: number) => {
    const target = facilities.find(f => f.id === id);
    if (target) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _, ...rest } = target;
      setFormData(rest);
      setEditId(id);
      setShowPopup(true);
    }
  };

  const handleDelete = (id: number) => {
    const target = facilities.find(f => f.id === id);
    if (!target) return;

    Swal.fire({
      title: 'Xác nhận xóa',
      text: `Bạn có chắc chắn muốn xóa cơ sở "${target.u_id}" không?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#e53e3e',
    }).then((result) => {
      if (result.isConfirmed) {
        setFacilities(prev => prev.filter(f => f.id !== id));
        Swal.fire('Đã xóa!', 'Cơ sở đã được xóa.', 'success');
      }
    });
  };

  const filteredFacilities = facilities.filter(f =>
    f.u_id.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    f.address.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    f.description.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  return (
    <>
    <Header />
    <div className="min-h-screen p-6 text-gray-800 max-w-6xl mx-auto font-[Poppins]">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-green-700 mb-6">📋 Quản lý Cơ sở Vật chất</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="🔍 Tìm theo mã quản lý, địa chỉ hoặc mô tả..."
            className="w-full px-5 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-lg"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </div>
      </header>

      <section className="bg-white p-8 rounded-xl shadow-xl border border-gray-100 mb-10">
        <h2 className="text-2xl font-semibold text-green-700 mb-6">➕ Thêm Cơ sở Mới</h2>
        <form className="grid gap-6 md:grid-cols-2" onSubmit={handleSubmit}>
          <input required name="u_id" placeholder="👤 Mã người quản lý" value={formData.u_id} onChange={handleChange}
            className="px-4 py-3 border border-gray-300 rounded-md shadow-sm" />
          <input required type="time" name="open_time" value={formData.open_time} onChange={handleChange}
            className="px-4 py-3 border border-gray-300 rounded-md shadow-sm" />
          <input required type="time" name="close_time" value={formData.close_time} onChange={handleChange}
            className="px-4 py-3 border border-gray-300 rounded-md shadow-sm" />
          <input required name="address" placeholder="📍 Địa chỉ" value={formData.address} onChange={handleChange}
            className="px-4 py-3 border border-gray-300 rounded-md shadow-sm" />
          <textarea required name="description" placeholder="📝 Mô tả" value={formData.description} onChange={handleChange}
            className="md:col-span-2 px-4 py-3 border border-gray-300 rounded-md resize-none shadow-sm" />
          <textarea name="subdescription" placeholder="💬 Mô tả phụ" value={formData.subdescription} onChange={handleChange}
            className="md:col-span-2 px-4 py-3 border border-gray-300 rounded-md resize-none shadow-sm" />
          <button type="submit"
            className="md:col-span-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition">
            <CheckCircle size={20} /> {editId !== null ? 'Cập nhật' : 'Thêm Cơ Sở'}
          </button>
        </form>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredFacilities.map(fac => (
          <div
            key={fac.id}
            className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
          >
            <div className="absolute right-4 top-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleEdit(fac.id)}
                className="text-blue-600 hover:text-blue-800 transition"
                title="Chỉnh sửa"
              >
                <Edit3 size={18} />
              </button>
              <button
                onClick={() => handleDelete(fac.id)}
                className="text-red-600 hover:text-red-800 transition"
                title="Xoá"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <h3 className="text-xl font-semibold text-green-700 mb-3 flex items-center gap-2">
              <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm font-medium">
                #{fac.u_id}
              </span>
              <span className="text-gray-800">Cơ sở: {fac.description}</span>
            </h3>

            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <span className="font-semibold">📍 Địa chỉ:</span> {fac.address}
              </p>
              <p>
                <span className="font-semibold">⏰ Giờ hoạt động:</span>{' '}
                {fac.open_time} - {fac.close_time}
              </p>
              {fac.subdescription && (
                <p className="text-gray-500 italic">💬 {fac.subdescription}</p>
              )}
            </div>
          </div>
        ))}
      </section>


      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-green-700">🛠️ Chỉnh sửa cơ sở</h2>
              <button
                onClick={() => {
                  setShowPopup(false);
                  setEditId(null);
                }}
                className="text-gray-600 hover:text-red-500 text-xl font-bold"
              >
                <X />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <input required name="u_id" value={formData.u_id} onChange={handleChange}
                className="px-4 py-2 border border-gray-300 rounded-md" placeholder="Mã người quản lý" />
              <input required type="time" name="open_time" value={formData.open_time} onChange={handleChange}
                className="px-4 py-2 border border-gray-300 rounded-md" />
              <input required type="time" name="close_time" value={formData.close_time} onChange={handleChange}
                className="px-4 py-2 border border-gray-300 rounded-md" />
              <input required name="address" value={formData.address} onChange={handleChange}
                className="px-4 py-2 border border-gray-300 rounded-md" placeholder="Địa chỉ" />
              <textarea required name="description" value={formData.description} onChange={handleChange}
                className="px-4 py-2 border border-gray-300 rounded-md resize-none" placeholder="Mô tả" />
              <textarea name="subdescription" value={formData.subdescription} onChange={handleChange}
                className="px-4 py-2 border border-gray-300 rounded-md resize-none" placeholder="Mô tả phụ" />
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => { setShowPopup(false); setEditId(null); }}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-md">
                  Đóng
                </button>
                <button type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md">
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
      </>
  );
};

export default FacilityManager;