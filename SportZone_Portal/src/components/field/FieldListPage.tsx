import { useMemo, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../Header";
import SearchAndFilterBar from "./list/components/SearchAndFilterBar";
import ViewModeToggle from "./list/components/ViewModeToggle";
import FieldsContainer from "./list/components/FieldsContainer";
import { useFacilities } from "./list/hooks/useFacilities";
import type { Field } from "./list/types";

const FieldListPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState<string>("");
  // Sync searchTerm with ?search= param in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get("search") || "";
    setSearchTerm(searchParam);
  }, [location.search]);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { fields, loading } = useFacilities();

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 3;

  const filteredFields = useMemo(() => {
    return fields.filter((field) => {
      const searchLower = searchTerm.toLowerCase().trim();
      const fieldName = field.name.toLowerCase();
      const fieldLocation = field.location.toLowerCase();
      const fieldDescription = field.description.toLowerCase();
      const fieldSubdescription = field.subdescription?.toLowerCase() ?? "";

      const matchesSearch =
        searchLower === "" ||
        fieldName.includes(searchLower) ||
        fieldLocation.includes(searchLower) ||
        fieldDescription.includes(searchLower) ||
        fieldSubdescription.includes(searchLower) ||
        field.categoryFields.some((cat) =>
          cat.categoryFieldName.toLowerCase().includes(searchLower)
        );

      const matchesType =
        selectedType === "all" ||
        field.categoryFields.some(
          (cat) =>
            cat.categoryFieldName.toLowerCase() === selectedType.toLowerCase()
        );

      return matchesSearch && matchesType;
    });
  }, [searchTerm, selectedType, fields]);

  // Reset page when filter/search changes
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedType]);

  const totalPages = Math.ceil(filteredFields.length / pageSize);
  const paginatedFields = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredFields.slice(start, start + pageSize);
  }, [filteredFields, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll lên đầu danh sách sân
    const listSection = document.getElementById("field-list-section");
    if (listSection) {
      listSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleBookField = (field: Field) => {
    navigate(`/booking/${field.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Tìm sân thể thao
          </h1>

          <SearchAndFilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedType={selectedType}
            onTypeChange={setSelectedType}
          />

          <div className="flex justify-between items-center">
            <ViewModeToggle
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </div>
        </div>
      </div>

      <div id="field-list-section" className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <div className="mb-4 flex justify-between items-center">
              <p className="text-gray-600">
                {loading
                  ? "Đang tải..."
                  : `Tìm thấy ${filteredFields.length} sân phù hợp`}
              </p>
            </div>

            <FieldsContainer
              fields={paginatedFields}
              viewMode={viewMode}
              loading={loading}
              onBookField={handleBookField}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <nav
                  className="flex items-center bg-white rounded-[18px] border border-gray-300 px-1 py-0 min-w-[80px]"
                  aria-label="Pagination"
                >
                  <button
                    className={`w-7 h-7 flex items-center justify-center rounded-[8px] border-0 text-gray-400 bg-white text-lg transition-all duration-150 ${currentPage === 1
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-100"
                      }`}
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="Trang trước"
                  >
                    <span>&lt;</span>
                  </button>
                  {/* Custom pagination logic with ... */}
                  {(() => {
                    const pages = [];

                    // Logic để hiển thị các trang một cách thông minh
                    if (totalPages <= 7) {
                      // Nếu tổng số trang <= 7, hiển thị tất cả
                      for (let i = 1; i <= totalPages; i++) {
                        pages.push(i);
                      }
                    } else {
                      // Nếu tổng số trang > 7, sử dụng logic phức tạp hơn

                      // Luôn hiển thị trang đầu
                      pages.push(1);

                      // Hiển thị trang 2 nếu currentPage <= 4
                      if (currentPage <= 4) {
                        pages.push(2);
                      }

                      // Hiển thị trang 3 nếu currentPage <= 4
                      if (currentPage <= 4) {
                        pages.push(3);
                      }

                      // Hiển thị ellipsis bên trái nếu cần
                      if (currentPage > 4) {
                        pages.push("left-ellipsis");
                      }

                      // Hiển thị các trang xung quanh currentPage
                      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                        if (!pages.includes(i)) {
                          pages.push(i);
                        }
                      }

                      // Hiển thị ellipsis bên phải nếu cần
                      if (currentPage < totalPages - 3) {
                        pages.push("right-ellipsis");
                      }

                      // Hiển thị trang cuối nếu chưa có
                      if (!pages.includes(totalPages)) {
                        pages.push(totalPages);
                      }
                    }

                    // Sắp xếp các trang theo thứ tự
                    const sortedPages = pages.sort((a, b) => {
                      if (typeof a === "string") return 1;
                      if (typeof b === "string") return -1;
                      return a - b;
                    });
                    return sortedPages.map((page, idx) => {
                      if (
                        page === "left-ellipsis" ||
                        page === "right-ellipsis"
                      ) {
                        return (
                          <span
                            key={page + idx}
                            className="mx-1 text-green-400 text-lg select-none"
                          >
                            ...
                          </span>
                        );
                      }
                      return (
                        <button
                          key={page}
                          className={`w-9 h-8 flex items-center justify-center mx-0.5 rounded-[6px] border-0 text-base font-semibold transition-all duration-150
                            ${currentPage === page
                              ? "bg-green-500 text-white shadow font-bold"
                              : "bg-white text-green-600 hover:bg-green-50 border border-green-200"
                            }
                          `}
                          onClick={() => handlePageChange(Number(page))}
                          aria-current={
                            currentPage === page ? "page" : undefined
                          }
                          disabled={currentPage === page}
                        >
                          {page}
                        </button>
                      );
                    });
                  })()}
                  <button
                    className={`w-7 h-7 flex items-center justify-center rounded-[8px] border-0 text-gray-400 bg-white text-lg transition-all duration-150 ${currentPage === totalPages
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-100"
                      }`}
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    aria-label="Trang sau"
                  >
                    <span>&gt;</span>
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FieldListPage;
