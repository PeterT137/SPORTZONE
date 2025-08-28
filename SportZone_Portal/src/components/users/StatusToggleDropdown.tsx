import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Check, X } from "lucide-react";

interface StatusToggleDropdownProps {
    currentStatus: string;
    userId: number;
    onStatusChange: (userId: number, newStatus: string) => Promise<void>;
}

const StatusToggleDropdown: React.FC<StatusToggleDropdownProps> = ({
    currentStatus,
    userId,
    onStatusChange,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<string>(currentStatus);
    const [isLoading, setIsLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    const getStatusDisplay = (status: string) => {
        const isActive = status?.toLowerCase() === "active";
        return {
            text: isActive ? "Đã xác thực" : "Chưa xác thực",
            className: isActive
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
        };
    };

    const handleStatusSelect = (status: string) => {
        if (status === currentStatus) {
            setIsOpen(false);
            return;
        }

        setSelectedStatus(status);
        setShowConfirmModal(true);
        setIsOpen(false);
    };

    const handleConfirm = async () => {
        try {
            setIsLoading(true);
            await onStatusChange(userId, selectedStatus);
            setShowConfirmModal(false);
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setShowConfirmModal(false);
        setSelectedStatus(currentStatus);
    };

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Update selectedStatus when currentStatus changes
    useEffect(() => {
        setSelectedStatus(currentStatus);
    }, [currentStatus]);

    // Handle click outside to close modal
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                if (!isLoading) {
                    handleCancel();
                }
            }
        };

        if (showConfirmModal) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [showConfirmModal, isLoading]);

    const currentStatusDisplay = getStatusDisplay(currentStatus);

    return (
        <>
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity ${currentStatusDisplay.className}`}
                >
                    {currentStatusDisplay.text}
                    <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                    <div className="absolute z-10 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg">
                        <div className="py-1">
                            {currentStatus !== "Active" && (
                                <button
                                    onClick={() => handleStatusSelect("Active")}
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-green-50 flex items-center justify-between text-gray-700"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span>Đã xác thực</span>
                                    </div>
                                </button>
                            )}
                            {currentStatus !== "Inactive" && (
                                <button
                                    onClick={() => handleStatusSelect("Inactive")}
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 flex items-center justify-between text-gray-700"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                        <span>Chưa xác thực</span>
                                    </div>
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
                    <div className="bg-white rounded-lg p-6 max-w-4xl w-full shadow-xl" ref={modalRef}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Xác nhận thay đổi trạng thái
                            </h3>
                            <button
                                onClick={handleCancel}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                disabled={isLoading}
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mb-6 space-y-3">
                            <div className="text-gray-600 leading-relaxed">
                                <span>Bạn có chắc chắn muốn thay đổi trạng thái người dùng từ </span>
                                <span className={`font-medium ${getStatusDisplay(currentStatus).className}`}>
                                    {getStatusDisplay(currentStatus).text}
                                </span>
                                <span> thành </span>
                                <span className={`font-medium ${getStatusDisplay(selectedStatus || currentStatus).className}`}>
                                    {getStatusDisplay(selectedStatus || currentStatus).text}
                                </span>
                                <span> không?</span>
                            </div>
                            <div className="text-sm text-gray-500 leading-relaxed">
                                Hành động này sẽ ảnh hưởng đến quyền truy cập của người dùng vào hệ thống.
                            </div>
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={handleCancel}
                                disabled={isLoading}
                                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={isLoading}
                                className={`px-4 py-2 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${selectedStatus === "Active"
                                    ? "bg-green-600 hover:bg-green-700"
                                    : "bg-red-600 hover:bg-red-700"
                                    }`}
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Đang xử lý...
                                    </div>
                                ) : (
                                    "Xác nhận"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default StatusToggleDropdown;
