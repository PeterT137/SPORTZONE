import React, { useEffect } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

interface ToastProps {
    message: string;
    type: "success" | "error";
    isVisible: boolean;
    onClose: () => void;
    duration?: number;
}

const Toast: React.FC<ToastProps> = ({
    message,
    type,
    isVisible,
    onClose,
    duration = 3000,
}) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    if (!isVisible) return null;

    const bgColor = type === "success" ? "bg-green-500" : "bg-red-500";
    const icon = type === "success" ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />;

    return (
        <div className="fixed top-4 right-4 z-50">
            <div className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-80`}>
                {icon}
                <span className="flex-1">{message}</span>
                <button
                    onClick={onClose}
                    className="text-white hover:text-gray-200 transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};

export default Toast;
