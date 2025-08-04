import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Header";
import SearchAndFilterBar from "./list/components/SearchAndFilterBar";
import ViewModeToggle from "./list/components/ViewModeToggle";
import FieldsContainer from "./list/components/FieldsContainer";
import { useFacilities } from "./list/hooks/useFacilities";
import type { Field } from "./list/types";

const FieldListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { fields, loading } = useFacilities();

  const filteredFields = useMemo(() => {
    return fields.filter((field) => {
      const searchLower = searchTerm.toLowerCase().trim();
      const fieldName = field.name.toLowerCase();
      const fieldLocation = field.location.toLowerCase();
      const fieldDescription = field.description.toLowerCase();
      const fieldSubdescription = field.subdescription.toLowerCase();

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

      <div className="max-w-7xl mx-auto px-4 py-6">
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
              fields={filteredFields}
              viewMode={viewMode}
              loading={loading}
              onBookField={handleBookField}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FieldListPage;
