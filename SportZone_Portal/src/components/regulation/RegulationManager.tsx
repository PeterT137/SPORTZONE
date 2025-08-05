import React, { useState, useEffect } from "react";
import Sidebar from "../../Sidebar";
import { FileText, Plus, Edit, Trash2 } from "lucide-react";

interface Regulation {
  regulationId: number;
  regulationName: string;
  description: string;
  createdDate: string;
  isActive: boolean;
}

const RegulationManager: React.FC = () => {
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);

  // Mock data for now
  useEffect(() => {
    const mockData: Regulation[] = [
      {
        regulationId: 1,
        regulationName: "Quy định về thời gian đặt sân",
        description: "Khách hàng phải đặt sân trước ít nhất 2 giờ",
        createdDate: "2024-01-15",
        isActive: true,
      },
      {
        regulationId: 2,
        regulationName: "Quy định về hủy đặt sân",
        description: "Phải hủy trước 1 giờ để được hoàn tiền",
        createdDate: "2024-01-20",
        isActive: true,
      },
      {
        regulationId: 3,
        regulationName: "Quy định về thanh toán",
        description: "Thanh toán qua các phương thức được hỗ trợ",
        createdDate: "2024-02-01",
        isActive: false,
      },
    ];

    setTimeout(() => {
      setRegulations(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  const handleAddRegulation = () => {
    // TODO: Implement add regulation modal
    console.log("Add regulation");
  };

  const handleEditRegulation = (id: number) => {
    // TODO: Implement edit regulation
    console.log("Edit regulation", id);
  };

  const handleDeleteRegulation = (id: number) => {
    // TODO: Implement delete regulation
    console.log("Delete regulation", id);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex">
        <Sidebar />
        <div className="flex-1 ml-64 p-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex">
        <Sidebar />
        <div className="flex-1 ml-64 p-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Lỗi:</strong> {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        {/* Header */}
        <div className="bg-green-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">QUẢN LÝ QUY ĐỊNH HỆ THỐNG</h1>
              <p className="text-green-100 mt-1">
                Quản lý các quy định và chính sách của hệ thống
              </p>
            </div>
            <button
              onClick={handleAddRegulation}
              className="bg-green-700 hover:bg-green-800 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Thêm quy định
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Table Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Danh sách quy định
              </h2>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tên quy định
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mô tả
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {regulations.length > 0 ? (
                    regulations.map((regulation) => (
                      <tr
                        key={regulation.regulationId}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {regulation.regulationId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {regulation.regulationName}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                          {regulation.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(regulation.createdDate).toLocaleDateString(
                            "vi-VN"
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              regulation.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {regulation.isActive
                              ? "Hoạt động"
                              : "Không hoạt động"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                handleEditRegulation(regulation.regulationId)
                              }
                              className="text-green-600 hover:text-green-800 p-1"
                              title="Chỉnh sửa"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteRegulation(regulation.regulationId)
                              }
                              className="text-red-600 hover:text-red-800 p-1"
                              title="Xóa"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        Không có quy định nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegulationManager;
