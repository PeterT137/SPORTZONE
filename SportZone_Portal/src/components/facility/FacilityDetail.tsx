/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React from "react";
import {
  FiArrowLeft,
  FiClock,
  FiEdit,
  FiMapPin,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiX,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import Sidebar from "../../Sidebar";
import { useFacilityDetail } from "./useFacilityDetailHooks";

// =================================================================================
// FACILITY DETAIL COMPONENT (UI Layer)
// =================================================================================
const FacilityDetail: React.FC = () => {
  const {
    loading,
    isSubmitting,
    facility,
    navigate,
    activeTab,
    filteredFields,
    filteredServices,
    filteredDiscounts,
    categories,
    fieldFilter,
    serviceFilter,
    discountFilter,
    editField,
    editService,
    editDiscount,
    isAddFieldModalOpen,
    isAddServiceModalOpen,
    isAddDiscountModalOpen,
    fieldFormData,
    serviceFormData,
    discountFormData,
    newFieldFormData,
    newServiceFormData,
    newDiscountFormData,
    currentImageIndex,
    isCarouselPaused,
    setActiveTab,
    setFieldFilter,
    setServiceFilter,
    setDiscountFilter,
    setIsAddFieldModalOpen,
    setIsAddServiceModalOpen,
    setIsAddDiscountModalOpen,
    setServiceFormData,
    closeModal,
    handleDeleteField,
    handleEditField,
    handleSaveFieldEdit,
    handleAddField,
    handleFieldChange,
    handleNewFieldChange,
    handleManageField,
    handleDeleteService,
    handleEditService,
    handleSaveServiceEdit,
    handleAddService,
    handleServiceChange,
    handleNewServiceChange,
    handleDeleteDiscount,
    handleEditDiscount,
    handleSaveDiscountEdit,
    handleAddDiscount,
    handleDiscountChange,
    handleNewDiscountChange,
    nextImage,
    prevImage,
    goToImage,
    setIsCarouselPaused,
    getImageUrl,
    filteredRegulations,
    regulationFilter,
    setRegulationFilter,
    isAddRegulationModalOpen,
    setIsAddRegulationModalOpen,
    editRegulation,
    newRegulationFormData,
    setNewRegulationFormData,
    regulationFormData,
    setRegulationFormData,
    addRegulation,
    editRegulationHandler,
    saveRegulationEdit,
    deleteRegulation,
  } = useFacilityDetail();

  if (loading) {
    return (
      <>
        <Sidebar />
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 pl-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-green-600"></div>
            <h2 className="text-2xl font-bold text-gray-900 mt-4">
              Đang tải dữ liệu...
            </h2>
            <p className="text-gray-600">Vui lòng chờ trong giây lát.</p>
          </div>
        </div>
      </>
    );
  }

  // FIX: Handle case where facility is not found after loading
  if (!facility) {
    return (
      <>
        <Sidebar />
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 pl-64">
          <div className="text-center p-8 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-red-600 mb-2">
              Không tìm thấy cơ sở
            </h2>
            <p className="text-gray-600">
              Không thể tải dữ liệu cho cơ sở này hoặc cơ sở không tồn tại.
            </p>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mt-6 flex items-center justify-center gap-2 px-5 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <FiArrowLeft className="h-5 w-5" />
              Quay lại
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Sidebar />
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-green-50 pl-64">
        {/* Header Section */}
        <div className="bg-white shadow-lg border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all duration-200 hover:shadow-lg"
                  title="Quay lại"
                >
                  <FiArrowLeft className="h-5 w-5" />
                </button>
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-3 rounded-xl shadow-lg">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                    Chi tiết cơ sở
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Quản lý thông tin chi tiết và hoạt động của cơ sở
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                  <div className="w-2 h-2 bg-green-600 rounded-full mr-2 animate-pulse"></div>
                  Đang hoạt động
                </span>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1 px-6 sm:px-8 lg:px-10 py-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Management Tabs Container */}
            <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
              <div className="p-8">
                <div className="space-y-6 mb-8">
                  {/* Tab Navigation */}
                  <div className="flex justify-center">
                    <div className="flex bg-gradient-to-r from-gray-100 to-gray-50 rounded-2xl p-2 border-2 border-gray-200 shadow-lg">
                      <button
                        type="button"
                        onClick={() => setActiveTab("overview")}
                        className={`px-6 py-3 font-bold text-sm rounded-xl transition-all duration-300 transform ${activeTab === "overview"
                          ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-xl scale-105 border-2 border-green-400"
                          : "text-gray-700 hover:text-gray-900 hover:bg-white hover:shadow-md hover:scale-102 border-2 border-transparent"
                          }`}
                      >
                        <div className="flex items-center space-x-2">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z"
                            />
                          </svg>
                          <span>Tổng quan</span>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("fields")}
                        className={`px-6 py-3 font-bold text-sm rounded-xl transition-all duration-300 transform ${activeTab === "fields"
                          ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-xl scale-105 border-2 border-green-400"
                          : "text-gray-700 hover:text-gray-900 hover:bg-white hover:shadow-md hover:scale-102 border-2 border-transparent"
                          }`}
                      >
                        <div className="flex items-center space-x-2">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                          <span>Sân trong cơ sở</span>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("services")}
                        className={`px-6 py-3 font-bold text-sm rounded-xl transition-all duration-300 transform ${activeTab === "services"
                          ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-xl scale-105 border-2 border-green-400"
                          : "text-gray-700 hover:text-gray-900 hover:bg-white hover:shadow-md hover:scale-102 border-2 border-transparent"
                          }`}
                      >
                        <div className="flex items-center space-x-2">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8m8 0v2a2 2 0 002 2v1M8 6v2a2 2 0 00-2 2v1"
                            />
                          </svg>
                          <span>Dịch vụ</span>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("discounts")}
                        className={`px-6 py-3 font-bold text-sm rounded-xl transition-all duration-300 transform ${activeTab === "discounts"
                          ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-xl scale-105 border-2 border-green-400"
                          : "text-gray-700 hover:text-gray-900 hover:bg-white hover:shadow-md hover:scale-102 border-2 border-transparent"
                          }`}
                      >
                        <div className="flex items-center space-x-2">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z"
                            />
                          </svg>
                          <span>Mã giảm giá</span>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("regulations")}
                        className={`px-6 py-3 font-bold text-sm rounded-xl transition-all duration-300 transform ${activeTab === "regulations"
                          ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-xl scale-105 border-2 border-green-400"
                          : "text-gray-700 hover:text-gray-900 hover:bg-white hover:shadow-md hover:scale-102 border-2 border-transparent"
                          }`}
                      >
                        <div className="flex items-center space-x-2">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 9V7a5 5 0 00-10 0v2a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2z"
                            />
                          </svg>
                          <span>Quy định sân</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Controls Section (Add Buttons, Filters, Search) */}
                  {activeTab !== "overview" && (
                    <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                      {/* Add Button */}
                      <div className="flex-shrink-0">
                        {activeTab === "fields" && (
                          <button
                            type="button"
                            onClick={() => setIsAddFieldModalOpen(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                            disabled={isSubmitting}
                          >
                            <FiPlus className="h-5 w-5" />
                            <span>Thêm sân mới</span>
                          </button>
                        )}
                        {activeTab === "services" && (
                          <button
                            type="button"
                            onClick={() => setIsAddServiceModalOpen(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                            disabled={isSubmitting}
                          >
                            <FiPlus className="h-5 w-5" />
                            <span>Thêm dịch vụ mới</span>
                          </button>
                        )}
                        {activeTab === "discounts" && (
                          <button
                            type="button"
                            onClick={() => setIsAddDiscountModalOpen(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                            disabled={isSubmitting}
                          >
                            <FiPlus className="h-5 w-5" />
                            <span>Thêm mã giảm giá mới</span>
                          </button>
                        )}
                        {activeTab === "regulations" && (
                          <button
                            type="button"
                            onClick={() => setIsAddRegulationModalOpen(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                            disabled={isSubmitting}
                          >
                            <FiPlus className="h-5 w-5" />
                            <span>Thêm quy định mới</span>
                          </button>
                        )}
                      </div>

                      {/* Filter and Search */}
                      <div className="flex flex-col sm:flex-row gap-3 items-center flex-1 lg:max-w-2xl w-full">
                        <div className="relative flex-1 w-full">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                            <FiSearch className="h-5 w-5" />
                          </div>
                          <input
                            type="text"
                            placeholder={
                              activeTab === "fields"
                                ? "Tìm kiếm sân theo tên, loại sân, mô tả và địa chỉ"
                                : activeTab === "services"
                                  ? "Tìm kiếm dịch vụ theo tên và giá"
                                  : activeTab === "discounts"
                                    ? "Tìm kiếm mã giảm giá theo tên, phần trăm giảm giá và số lượng"
                                    : "Tìm kiếm quy định theo tên và mô tả"
                            }
                            value={
                              activeTab === "fields"
                                ? fieldFilter
                                : activeTab === "services"
                                  ? serviceFilter
                                  : activeTab === "discounts"
                                    ? discountFilter.startsWith("status:")
                                      ? ""
                                      : discountFilter
                                    : regulationFilter
                            }
                            onChange={(e) => {
                              if (activeTab === "fields")
                                setFieldFilter(e.target.value);
                              else if (activeTab === "services")
                                setServiceFilter(e.target.value);
                              else if (activeTab === "discounts")
                                setDiscountFilter(e.target.value);
                              else if (activeTab === "regulations")
                                setRegulationFilter(e.target.value);
                            }}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm hover:shadow-md font-medium text-gray-700 placeholder-gray-400"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tab Content */}
                {activeTab === "overview" && (
                  <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200 -m-8 mt-0">
                    <div className="md:flex">
                      <div className="md:w-2/5 lg:w-1/3">
                        <div
                          style={{ height: "33vw", minHeight: "400px" }}
                          className="relative h-full group"
                          onMouseEnter={() => setIsCarouselPaused(true)}
                          onMouseLeave={() => setIsCarouselPaused(false)}
                        >
                          {/* Image Carousel */}
                          {facility.images && facility.images.length > 0 ? (
                            <>
                              <img
                                src={
                                  facility.images[currentImageIndex]
                                    ?.imageUrl || getImageUrl(undefined)
                                }
                                alt={`Facility image ${currentImageIndex + 1}`}
                                className="w-full h-full object-cover transition-opacity duration-300"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = getImageUrl(undefined);
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                              {facility.images.length > 1 && (
                                <>
                                  <button
                                    type="button"
                                    onClick={prevImage}
                                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
                                    title="Previous image"
                                  >
                                    <FiChevronLeft className="w-5 h-5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={nextImage}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
                                    title="Next image"
                                  >
                                    <FiChevronRight className="w-5 h-5" />
                                  </button>
                                  <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm font-medium">
                                    {currentImageIndex + 1} /{" "}
                                    {facility.images.length}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setIsCarouselPaused(!isCarouselPaused)
                                    }
                                    className="absolute top-4 left-4 bg-black bg-opacity-60 hover:bg-opacity-80 text-white p-2 rounded-full transition-all duration-200"
                                    title={
                                      isCarouselPaused
                                        ? "Play slideshow"
                                        : "Pause slideshow"
                                    }
                                  >
                                    {isCarouselPaused ? (
                                      <svg
                                        className="w-4 h-4"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    ) : (
                                      <svg
                                        className="w-4 h-4"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    )}
                                  </button>
                                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                                    {facility.images.map((_, index) => (
                                      <button
                                        key={index}
                                        type="button"
                                        onClick={() => goToImage(index)}
                                        className={`w-2 h-2 rounded-full transition-all duration-200 ${index === currentImageIndex
                                          ? "bg-white scale-125"
                                          : "bg-white bg-opacity-50 hover:bg-opacity-75"
                                          }`}
                                        title={`Go to image ${index + 1}`}
                                      />
                                    ))}
                                  </div>
                                </>
                              )}
                            </>
                          ) : (
                            <>
                              <img
                                src={facility.picture || getImageUrl(undefined)}
                                alt="Facility"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    getImageUrl(undefined);
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="md:w-3/5 lg:w-2/3 p-8">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex-1">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                              {facility.name}
                            </h2>
                            <p className="text-gray-600 text-lg leading-relaxed">
                              {facility.description}
                            </p>
                            {facility.subdescription && (
                              <p className="text-gray-600 text-lg leading-relaxed">
                                {facility.subdescription}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <div className="flex items-start space-x-3">
                              <div className="bg-green-100 p-2 rounded-lg">
                                <FiMapPin className="h-5 w-5 text-green-600" />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                                  Địa chỉ
                                </h3>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                  {facility.address}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <div className="flex items-start space-x-3">
                              <div className="bg-green-100 p-2 rounded-lg">
                                <FiClock className="h-5 w-5 text-green-600" />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                                  Giờ hoạt động
                                </h3>
                                <div className="flex items-center space-x-2">
                                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs font-medium">
                                    Mở: {facility.openTime}
                                  </span>
                                  <span className="text-gray-400">-</span>
                                  <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-md text-xs font-medium">
                                    Đóng: {facility.closeTime}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Thống kê tổng quan
                          </h3>
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="text-center">
                              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <div className="text-2xl font-bold text-green-600">
                                  {filteredFields.length}
                                </div>
                                <div className="text-sm text-gray-600 font-medium">
                                  Sân bóng
                                </div>
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <div className="text-2xl font-bold text-green-600">
                                  {filteredServices.length}
                                </div>
                                <div className="text-sm text-gray-600 font-medium">
                                  Dịch vụ
                                </div>
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <div className="text-2xl font-bold text-green-600">
                                  {filteredDiscounts.length}
                                </div>
                                <div className="text-sm text-gray-600 font-medium">
                                  Mã giảm giá
                                </div>
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <div className="text-2xl font-bold text-emerald-600">
                                  {facility.images?.length || 0}
                                </div>
                                <div className="text-sm text-gray-600 font-medium">
                                  Hình ảnh
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "fields" && (
                  <div className="space-y-6">
                    {filteredFields.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="bg-gray-50 rounded-2xl p-8 max-w-md mx-auto">
                          <svg
                            className="w-16 h-16 text-gray-300 mx-auto mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {fieldFilter.trim() ? "Không tìm được sân theo yêu cầu" : "Chưa có sân nào"}
                          </h3>
                          <p className="text-gray-600 mb-4">
                            {fieldFilter.trim()
                              ? "Không có sân nào phù hợp với từ khóa tìm kiếm của bạn. Hãy thử từ khóa khác."
                              : "Hãy thêm sân đầu tiên để bắt đầu quản lý"
                            }
                          </p>
                          {!fieldFilter.trim() && (
                            <button
                              type="button"
                              onClick={() => setIsAddFieldModalOpen(true)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                            >
                              <FiPlus className="h-4 w-4" /> Thêm sân đầu tiên
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-green-50 to-emerald-50">
                              <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                                  STT
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                                  Tên sân
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                                  Loại sân
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                                  Mô tả
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                                  Địa chỉ
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                                  Trạng thái
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                                  Thao tác
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                              {filteredFields.map((field, index) => (
                                <tr
                                  key={field.fieldId}
                                  className="hover:bg-green-50 transition-colors duration-150 group"
                                >
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                                      {index + 1}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 group-hover:text-green-600">
                                    {field.fieldName}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
                                      {field.categoryName}
                                    </span>
                                  </td>
                                  <td
                                    className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate"
                                    title={field.description}
                                  >
                                    {field.description || "Không có mô tả"}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                                    {field.facilityAddress}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                      className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${field.isBookingEnable
                                        ? "bg-green-100 text-green-800 border border-green-200"
                                        : "bg-red-100 text-red-800 border border-red-200"
                                        }`}
                                    >
                                      {field.isBookingEnable
                                        ? "Có thể đặt"
                                        : "Không thể đặt"}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center space-x-2">
                                      <button
                                        type="button"
                                        onClick={() => handleEditField(field)}
                                        className="bg-blue-100 text-blue-700 hover:bg-blue-200 p-2 rounded-lg text-xs font-medium transition-all"
                                        title="Chỉnh sửa"
                                      >
                                        <FiEdit className="h-4 w-4" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleDeleteField(field.fieldId)
                                        }
                                        className="bg-red-100 text-red-700 hover:bg-red-200 p-2 rounded-lg text-xs font-medium transition-all"
                                        title="Xóa"
                                        disabled={isSubmitting}
                                      >
                                        <FiTrash2 className="h-4 w-4" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleManageField(
                                            field.fieldId,
                                            field.fieldName
                                          )
                                        }
                                        className="bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-2 rounded-lg text-xs font-medium transition-all"
                                        title="Quản lý lịch"
                                      >
                                        Quản lý lịch
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "services" && (
                  <div className="space-y-4">
                    {filteredServices.length === 0 ? (
                      <div className="text-center py-16 text-gray-500">
                        <div className="text-lg font-medium mb-2">
                          {serviceFilter.trim() ? "Không tìm được dịch vụ theo yêu cầu" : "Chưa có dịch vụ nào"}
                        </div>
                        <div className="text-sm">
                          {serviceFilter.trim()
                            ? "Không có dịch vụ nào phù hợp với từ khóa tìm kiếm của bạn. Hãy thử từ khóa khác."
                            : "Hãy thêm dịch vụ mới hoặc kiểm tra lại từ khóa tìm kiếm."
                          }
                        </div>
                      </div>
                    ) : (
                      <div className="overflow-x-auto shadow-sm border border-gray-200 rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gradient-to-r from-green-50 to-emerald-50">
                            <tr>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                                STT
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                                Hình ảnh
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                                Tên dịch vụ
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                                Giá
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                                Trạng thái
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                                Thao tác
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {filteredServices.map((service, index) => (
                              <tr
                                key={service.serviceId}
                                className="hover:bg-gray-50 transition-colors duration-150"
                              >
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-bold">
                                  {index + 1}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <img
                                    src={getImageUrl(service.image)}
                                    alt={service.serviceName}
                                    className="h-16 w-16 object-cover rounded-lg border border-gray-200 shadow-sm"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src =
                                        getImageUrl(undefined);
                                    }}
                                  />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                  {service.serviceName}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-700 font-medium">
                                  {service.price.toLocaleString()} VND
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span
                                    className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${service.status === "Active" ||
                                      service.status === "Available"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                      }`}
                                  >
                                    {service.status === "Active" ||
                                      service.status === "Available"
                                      ? "Hoạt động"
                                      : "Tạm dừng"}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleEditService(service)}
                                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-md"
                                      title="Chỉnh sửa"
                                    >
                                      <FiEdit className="h-4 w-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDeleteService(service.serviceId)
                                      }
                                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-md"
                                      title="Xóa"
                                      disabled={isSubmitting}
                                    >
                                      <FiTrash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "discounts" && (
                  <div className="space-y-6">
                    {filteredDiscounts.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="bg-gradient-to-br from-gray-50 to-green-50 rounded-2xl p-12 max-w-md mx-auto border border-gray-200 shadow-sm">
                          <h3 className="text-xl font-bold text-gray-900 mb-3">
                            {discountFilter.trim() ? "Không tìm được mã giảm giá theo yêu cầu" : "Chưa có mã giảm giá nào"}
                          </h3>
                          <p className="text-gray-600 mb-6 leading-relaxed">
                            {discountFilter.trim()
                              ? "Không có mã giảm giá nào phù hợp với từ khóa tìm kiếm của bạn. Hãy thử từ khóa khác."
                              : "Hãy tạo mã giảm giá mới để thu hút khách hàng."
                            }
                          </p>
                          {!discountFilter.trim() && (
                            <button
                              type="button"
                              onClick={() => setIsAddDiscountModalOpen(true)}
                              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl"
                            >
                              <FiPlus className="h-5 w-5" /> Tạo mã giảm giá
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="overflow-x-auto shadow-sm border border-gray-200 rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gradient-to-r from-green-50 to-emerald-50">
                            <tr>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                                STT
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                                % Giảm giá
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                                Thời gian áp dụng
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                                Tên mã giảm giá
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                                Số lượng
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                                Trạng thái
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                                Thao tác
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {filteredDiscounts.map((discount, index) => (
                              <tr
                                key={discount.discountId}
                                className="hover:bg-gray-50"
                              >
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-600">
                                  {index + 1}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-700">
                                  {discount.discountPercentage}%
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                  <div>
                                    {new Date(
                                      discount.startDate
                                    ).toLocaleDateString("vi-VN")}{" "}
                                    -{" "}
                                    {new Date(
                                      discount.endDate
                                    ).toLocaleDateString("vi-VN")}
                                  </div>
                                </td>
                                <td
                                  className="px-6 py-4 text-sm text-gray-800 max-w-xs truncate"
                                  title={discount.description}
                                >
                                  {discount.description || "Không có mô tả"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                                  {discount.quantity}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span
                                    className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${discount.isActive
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                      }`}
                                  >
                                    {discount.isActive
                                      ? "Hoạt động"
                                      : "Tạm dừng"}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleEditDiscount(discount)
                                      }
                                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-md"
                                      title="Chỉnh sửa"
                                    >
                                      <FiEdit className="h-4 w-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDeleteDiscount(
                                          discount.discountId
                                        )
                                      }
                                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-md"
                                      title="Xóa"
                                      disabled={isSubmitting}
                                    >
                                      <FiTrash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "regulations" && (
                  <div className="space-y-6">
                    {filteredRegulations.length === 0 && !regulationFilter ? (
                      <div className="text-center py-16">
                        <div className="bg-gray-50 rounded-2xl p-8 max-w-md mx-auto">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Chưa có quy định nào
                          </h3>
                          <p className="text-gray-600 mb-4">
                            Hãy thêm quy định cho cơ sở của bạn.
                          </p>
                          <button
                            type="button"
                            onClick={() => setIsAddRegulationModalOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                          >
                            <FiPlus className="h-4 w-4" /> Thêm quy định
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gradient-to-r from-green-50 to-emerald-50">
                              <tr className="bg-green-100">
                                <th className="px-4 py-3 text-left font-bold text-gray-700 uppercase">
                                  STT
                                </th>
                                <th className="px-4 py-3 text-left font-bold text-gray-700 uppercase">
                                  Tên quy định
                                </th>
                                <th className="px-4 py-3 text-left font-bold text-gray-700 uppercase">
                                  Mô tả
                                </th>
                                <th className="px-4 py-3 text-left font-bold text-gray-700 uppercase">
                                  Trạng thái
                                </th>
                                <th className="px-4 py-3 text-left font-bold text-gray-700 uppercase">
                                  Thao tác
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                              {filteredRegulations.map((regulation, idx) => (
                                <tr key={regulation.id}>
                                  <td className="px-4 py-3">{idx + 1}</td>
                                  <td className="px-4 py-3 font-semibold text-gray-900">
                                    {regulation.title}
                                  </td>
                                  <td className="px-4 py-3 text-gray-700">
                                    {regulation.description}
                                  </td>
                                  <td className="px-4 py-3">
                                    <span
                                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${regulation.status === "Active"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                        }`}
                                    >
                                      {regulation.status === "Active"
                                        ? "Hoạt động"
                                        : "Tạm dừng"}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center space-x-2">
                                      <button
                                        onClick={() =>
                                          editRegulationHandler(regulation)
                                        }
                                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                                        title="Chỉnh sửa"
                                      >
                                        <FiEdit className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() =>
                                          deleteRegulation(regulation.id)
                                        }
                                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                                        title="Xóa"
                                      >
                                        <FiTrash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {filteredRegulations.length === 0 &&
                            regulationFilter && (
                              <div className="text-center py-16">
                                <div className="bg-gray-50 rounded-2xl p-8 max-w-md mx-auto">
                                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Không tìm được quy định theo yêu cầu
                                  </h3>
                                  <p className="text-gray-600 mb-4">
                                    Không có quy định nào phù hợp với từ khóa tìm kiếm của bạn. Hãy thử từ khóa khác.
                                  </p>
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* MODALS (Centralized Location) */}

      {/* --- Add Field Modal --- */}
      {isAddFieldModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Thêm sân mới</h3>
              <button
                onClick={closeModal}
                className="text-white p-2 rounded-full hover:bg-white/20"
              >
                <FiX />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Tên sân <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fieldName"
                  value={newFieldFormData.fieldName || ""}
                  onChange={handleNewFieldChange}
                  className="w-full px-4 py-3 border rounded-xl"
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Loại sân
                </label>
                <select
                  name="categoryId"
                  value={newFieldFormData.categoryId || ""}
                  onChange={handleNewFieldChange}
                  className="w-full px-4 py-3 border rounded-xl"
                  disabled={isSubmitting}
                >
                  <option value="">Chọn loại sân</option>
                  {categories.map((c) => (
                    <option key={c.categoryId} value={c.categoryId}>
                      {c.categoryName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Mô tả sân
                </label>
                <textarea
                  name="description"
                  value={newFieldFormData.description || ""}
                  onChange={handleNewFieldChange}
                  rows={3}
                  className="w-full px-4 py-3 border rounded-xl resize-none"
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="isBookingEnable"
                  checked={newFieldFormData.isBookingEnable || false}
                  onChange={handleNewFieldChange}
                  className="h-5 w-5 text-green-600 rounded"
                  disabled={isSubmitting}
                />
                <label className="text-sm font-bold text-gray-700">
                  Cho phép đặt sân trực tuyến
                </label>
              </div>
              <div className="flex justify-end space-x-4 pt-4 border-t">
                <button
                  onClick={closeModal}
                  className="px-6 py-2 border rounded-xl"
                  disabled={isSubmitting}
                >
                  Hủy
                </button>
                <button
                  onClick={handleAddField}
                  className="px-6 py-2 bg-green-600 text-white rounded-xl"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang thêm..." : "Thêm sân"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Edit Field Modal --- */}
      {editField && fieldFormData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">
                Chỉnh sửa sân: {editField.fieldName}
              </h3>
              <button
                onClick={closeModal}
                className="text-white p-2 rounded-full hover:bg-white/20"
              >
                <FiX />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Tên sân <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fieldName"
                  value={fieldFormData.fieldName || ""}
                  onChange={handleFieldChange}
                  className="w-full px-4 py-3 border rounded-xl"
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Loại sân
                </label>
                <select
                  name="categoryId"
                  value={fieldFormData.categoryId || ""}
                  onChange={handleFieldChange}
                  className="w-full px-4 py-3 border rounded-xl"
                  disabled={isSubmitting}
                >
                  {categories.map((c) => (
                    <option key={c.categoryId} value={c.categoryId}>
                      {c.categoryName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Mô tả
                </label>
                <textarea
                  name="description"
                  value={fieldFormData.description || ""}
                  onChange={handleFieldChange}
                  rows={3}
                  className="w-full px-4 py-3 border rounded-xl"
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="isBookingEnable"
                  checked={fieldFormData.isBookingEnable || false}
                  onChange={handleFieldChange}
                  className="h-5 w-5 text-blue-600 rounded"
                  disabled={isSubmitting}
                />
                <label className="text-sm font-bold text-gray-700">
                  Cho phép đặt
                </label>
              </div>
              <div className="flex justify-end space-x-4 pt-4 border-t">
                <button
                  onClick={closeModal}
                  className="px-6 py-2 border rounded-xl"
                  disabled={isSubmitting}
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveFieldEdit}
                  className="px-6 py-2 bg-blue-600 text-white rounded-xl"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang cập nhật..." : "Cập nhật"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Add Service Modal --- */}
      {isAddServiceModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Thêm dịch vụ mới</h3>
              <button
                onClick={closeModal}
                className="text-white p-2 rounded-full hover:bg-white/20"
              >
                <FiX />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label htmlFor="serviceName" className="block text-sm font-bold text-gray-700 mb-1">Tên dịch vụ <span className="text-red-500">*</span></label>
                <input
                  id="serviceName"
                  type="text"
                  name="serviceName"
                  value={newServiceFormData.serviceName}
                  onChange={handleNewServiceChange}
                  className="w-full p-3 border rounded-xl"
                />
              </div>
              <div>
                <label htmlFor="price" className="block text-sm font-bold text-gray-700 mb-1">Giá dịch vụ <span className="text-red-500">*</span></label>
                <input
                  id="price"
                  type="number"
                  name="price"
                  value={newServiceFormData.price}
                  onChange={handleNewServiceChange}
                  className="w-full p-3 border rounded-xl"
                />
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-bold text-gray-700 mb-1">Trạng thái</label>
                <select
                  id="status"
                  name="status"
                  value={newServiceFormData.status}
                  onChange={handleNewServiceChange}
                  className="w-full p-3 border rounded-xl"
                >
                  <option value="Active">Hoạt động</option>
                  <option value="Inactive">Tạm dừng</option>
                </select>
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-bold text-gray-700 mb-1">Mô tả dịch vụ</label>
                <textarea
                  id="description"
                  name="description"
                  value={newServiceFormData.description}
                  onChange={handleNewServiceChange}
                  rows={3}
                  className="w-full p-3 border rounded-xl resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Hình ảnh
                </label>
                <input
                  type="file"
                  name="imageFile"
                  accept="image/*"
                  onChange={handleNewServiceChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
              </div>
              {newServiceFormData.imageFile && (
                <img
                  src={URL.createObjectURL(newServiceFormData.imageFile)}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-xl mt-2"
                />
              )}
              <div className="flex justify-end space-x-4 pt-4 border-t">
                <button
                  onClick={closeModal}
                  className="px-6 py-2 border rounded-xl"
                  disabled={isSubmitting}
                >
                  Hủy
                </button>
                <button
                  onClick={handleAddService}
                  className="px-6 py-2 bg-green-600 text-white rounded-xl"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang thêm..." : "Thêm dịch vụ"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* --- Edit Service Modal --- */}
      {editService && serviceFormData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">
                Chỉnh sửa dịch vụ: {editService.serviceName}
              </h3>
              <button
                onClick={closeModal}
                className="text-white p-2 rounded-full hover:bg-white/20"
              >
                <FiX />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label htmlFor="editServiceName" className="block text-sm font-bold text-gray-700 mb-1">Tên dịch vụ <span className="text-red-500">*</span></label>
                <input
                  id="editServiceName"
                  type="text"
                  name="serviceName"
                  value={serviceFormData.serviceName}
                  onChange={handleServiceChange}
                  className="w-full p-3 border rounded-xl"
                />
              </div>
              <div>
                <label htmlFor="editPrice" className="block text-sm font-bold text-gray-700 mb-1">Giá dịch vụ <span className="text-red-500">*</span></label>
                <input
                  id="editPrice"
                  type="number"
                  name="price"
                  value={serviceFormData.price}
                  onChange={handleServiceChange}
                  className="w-full p-3 border rounded-xl"
                />
              </div>
              <div>
                <label htmlFor="editStatus" className="block text-sm font-bold text-gray-700 mb-1">Trạng thái</label>
                <select
                  id="editStatus"
                  name="status"
                  value={serviceFormData.status}
                  onChange={handleServiceChange}
                  className="w-full p-3 border rounded-xl"
                >
                  <option value="Active">Hoạt động</option>
                  <option value="Inactive">Tạm dừng</option>
                </select>
              </div>
              <div>
                <label htmlFor="editDescription" className="block text-sm font-bold text-gray-700 mb-1">Mô tả dịch vụ</label>
                <textarea
                  id="editDescription"
                  name="description"
                  value={serviceFormData.description}
                  onChange={handleServiceChange}
                  rows={3}
                  className="w-full p-3 border rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Thay đổi hình ảnh
                </label>
                <input
                  type="file"
                  name="imageFile"
                  accept="image/*"
                  onChange={handleServiceChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              {!serviceFormData.imageFile &&
                editService.image &&
                !serviceFormData.removeImage && (
                  <div className="relative w-32 h-32">
                    <img
                      src={getImageUrl(editService.image)}
                      alt="Current"
                      className="w-full h-full object-cover rounded-xl"
                    />
                    <button
                      onClick={() =>
                        setServiceFormData((prev) =>
                          prev ? { ...prev, removeImage: true } : null
                        )
                      }
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <FiX size={12} />
                    </button>
                  </div>
                )}
              {serviceFormData.imageFile && (
                <img
                  src={URL.createObjectURL(serviceFormData.imageFile)}
                  alt="New Preview"
                  className="w-32 h-32 object-cover rounded-xl"
                />
              )}
              {serviceFormData.removeImage && (
                <p className="text-red-500 text-sm">
                  Hình ảnh sẽ bị xóa khi lưu.
                </p>
              )}
              <div className="flex justify-end space-x-4 pt-4 border-t">
                <button
                  onClick={closeModal}
                  className="px-6 py-2 border rounded-xl"
                  disabled={isSubmitting}
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveServiceEdit}
                  className="px-6 py-2 bg-blue-600 text-white rounded-xl"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang cập nhật..." : "Cập nhật"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* --- Add Discount Modal --- */}
      {isAddDiscountModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">
                Thêm mã giảm giá mới
              </h3>
              <button
                onClick={closeModal}
                className="text-white p-2 rounded-full hover:bg-white/20"
              >
                <FiX />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="discountPercentage" className="block text-sm font-bold text-gray-700 mb-1">Phần trăm giảm giá (%) <span className="text-red-500">*</span></label>
                <input
                  id="discountPercentage"
                  type="number"
                  name="discountPercentage"
                  value={newDiscountFormData.discountPercentage}
                  onChange={handleNewDiscountChange}
                  className="w-full p-3 border rounded-xl"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-bold text-gray-700 mb-1">Tên / Mô tả mã giảm giá <span className="text-red-500">*</span></label>
                <input
                  id="description"
                  type="text"
                  name="description"
                  value={newDiscountFormData.description}
                  onChange={handleNewDiscountChange}
                  className="w-full p-3 border rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-bold text-gray-700 mb-1">Ngày bắt đầu <span className="text-red-500">*</span></label>
                  <input
                    id="startDate"
                    type="date"
                    name="startDate"
                    value={newDiscountFormData.startDate}
                    onChange={handleNewDiscountChange}
                    className="w-full p-3 border rounded-xl"
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-bold text-gray-700 mb-1">Ngày kết thúc <span className="text-red-500">*</span></label>
                  <input
                    id="endDate"
                    type="date"
                    name="endDate"
                    value={newDiscountFormData.endDate}
                    onChange={handleNewDiscountChange}
                    className="w-full p-3 border rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="quantity" className="block text-sm font-bold text-gray-700 mb-1">Số lượng <span className="text-red-500">*</span></label>
                <input
                  id="quantity"
                  type="number"
                  name="quantity"
                  value={newDiscountFormData.quantity}
                  onChange={handleNewDiscountChange}
                  className="w-full p-3 border rounded-xl"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={newDiscountFormData.isActive}
                  onChange={handleNewDiscountChange}
                  className="h-5 w-5 text-green-600 rounded"
                />
                <label htmlFor="isActive" className="text-sm font-bold">Kích hoạt ngay</label>
              </div>
              <div className="flex justify-end space-x-4 pt-4 border-t">
                <button
                  onClick={closeModal}
                  className="px-6 py-2 border rounded-xl"
                  disabled={isSubmitting}
                >
                  Hủy
                </button>
                <button
                  onClick={handleAddDiscount}
                  className="px-6 py-2 bg-green-600 text-white rounded-xl"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang thêm..." : "Thêm mã"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Edit Discount Modal --- */}
      {editDiscount && discountFormData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">
                Chỉnh sửa mã giảm giá
              </h3>
              <button
                onClick={closeModal}
                className="text-white p-2 rounded-full hover:bg-white/20"
              >
                <FiX />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="discountPercentage" className="block text-sm font-bold text-gray-700 mb-1">Phần trăm giảm giá (%) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  name="discountPercentage"
                  value={discountFormData.discountPercentage}
                  onChange={handleDiscountChange}
                  placeholder="Phần trăm giảm giá (%)"
                  className="w-full p-3 border rounded-xl"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-bold text-gray-700 mb-1">Tên / Mô tả mã giảm giá <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="description"
                  value={discountFormData.description}
                  onChange={handleDiscountChange}
                  placeholder="Tên / Mô tả mã giảm giá"
                  className="w-full p-3 border rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-sm text-gray-600">Ngày bắt đầu <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    name="startDate"
                    value={discountFormData.startDate.split("T")[0]}
                    onChange={handleDiscountChange}
                    className="w-full p-3 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-sm text-gray-600">Ngày kết thúc <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    name="endDate"
                    value={discountFormData.endDate.split("T")[0]}
                    onChange={handleDiscountChange}
                    className="w-full p-3 border rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="quantity" className="block text-sm font-bold text-gray-700 mb-1">Số lượng <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  name="quantity"
                  value={discountFormData.quantity}
                  onChange={handleDiscountChange}
                  placeholder="Số lượng"
                  className="w-full p-3 border rounded-xl"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={discountFormData.isActive}
                  onChange={handleDiscountChange}
                  className="h-5 w-5 text-blue-600 rounded"
                />
                <label className="text-sm font-bold">Đang hoạt động</label>
              </div>
              <div className="flex justify-end space-x-4 pt-4 border-t">
                <button
                  onClick={closeModal}
                  className="px-6 py-2 border rounded-xl"
                  disabled={isSubmitting}
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveDiscountEdit}
                  className="px-6 py-2 bg-blue-600 text-white rounded-xl"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang cập nhật..." : "Cập nhật"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAddRegulationModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">
                Thêm quy định mới
              </h3>
              <button
                onClick={closeModal}
                className="text-white p-2 rounded-full hover:bg-white/20"
              >
                <FiX />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={newRegulationFormData.title || ""}
                  onChange={(e) =>
                    setNewRegulationFormData({
                      ...newRegulationFormData,
                      title: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border rounded-xl"
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Mô tả <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={newRegulationFormData.description || ""}
                  onChange={(e) =>
                    setNewRegulationFormData({
                      ...newRegulationFormData,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-4 py-3 border rounded-xl resize-none"
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Trạng thái
                </label>
                <select
                  name="status"
                  value={newRegulationFormData.status || "Active"}
                  onChange={(e) =>
                    setNewRegulationFormData({
                      ...newRegulationFormData,
                      status: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border rounded-xl"
                  disabled={isSubmitting}
                >
                  <option value="Active">Hoạt động</option>
                  <option value="Inactive">Tạm dừng</option>
                </select>
              </div>
              <div className="flex justify-end space-x-4 pt-4 border-t">
                <button
                  onClick={closeModal}
                  className="px-6 py-2 border rounded-xl"
                  disabled={isSubmitting}
                >
                  Hủy
                </button>
                <button
                  onClick={() => {
                    if (!facility || !facility.facId || facility.facId === 0) {
                      alert(
                        "Vui lòng chọn cơ sở hợp lệ trước khi thêm quy định."
                      );
                      return;
                    }
                    if (
                      !newRegulationFormData.title ||
                      !newRegulationFormData.description ||
                      !newRegulationFormData.status
                    )
                      // {
                      //   alert("Vui lòng nhập đầy đủ thông tin quy định.");
                      //   return;
                      // }
                      addRegulation();
                  }}
                  className="px-6 py-2 bg-green-600 text-white rounded-xl"
                  disabled={isSubmitting}
                >
                  Thêm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {editRegulation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">
                Chỉnh sửa quy định
              </h3>
              <button
                onClick={closeModal}
                className="text-white p-2 rounded-full hover:bg-white/20"
              >
                <FiX />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={regulationFormData.title || ""}
                  onChange={(e) =>
                    setRegulationFormData({
                      ...regulationFormData,
                      title: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border rounded-xl"
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Mô tả <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={regulationFormData.description || ""}
                  onChange={(e) =>
                    setRegulationFormData({
                      ...regulationFormData,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-4 py-3 border rounded-xl resize-none"
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Trạng thái
                </label>
                <select
                  name="status"
                  value={regulationFormData.status || "Active"}
                  onChange={(e) =>
                    setRegulationFormData({
                      ...regulationFormData,
                      status: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border rounded-xl"
                  disabled={isSubmitting}
                >
                  <option value="Active">Hoạt động</option>
                  <option value="Inactive">Tạm dừng</option>
                </select>
              </div>
              <div className="flex justify-end space-x-4 pt-4 border-t">
                <button
                  onClick={closeModal}
                  className="px-6 py-2 border rounded-xl"
                  disabled={isSubmitting}
                >
                  Hủy
                </button>
                <button
                  onClick={saveRegulationEdit}
                  className="px-6 py-2 bg-blue-600 text-white rounded-xl"
                  disabled={isSubmitting}
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FacilityDetail;
