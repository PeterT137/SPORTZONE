/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import { MdAccessTime, MdAttachMoney, MdPeople, MdShoppingCart } from "react-icons/md"
import Sidebar from "../../Sidebar"
import type { Order, OrderServiceType, Service, User } from "../interface"
import { OrderList } from "../order/OrderList"
import { OrderService } from "../services/orderServices"; // Sửa đường dẫn

export function OrderManagement() {
    const [orders, setOrders] = useState<Order[]>([])
    const [orderServices, setOrderServices] = useState<OrderServiceType[]>([])
    const [services, setServices] = useState<Service[]>([])
    const [loading, setLoading] = useState(true)

    // Mock user - replace with actual authentication
    const [currentUser, setCurrentUser] = useState<User>({
        id: "user_1",
        name: "Admin User",
        role: "admin",
    })

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true)
                const [ordersData, orderServicesData, servicesData] = await Promise.all([
                    OrderService.getOrders(),
                    OrderService.getOrderServices(),
                    OrderService.getServices(),
                ])

                setOrders(ordersData)
                setOrderServices(orderServicesData)
                setServices(servicesData)
            } catch (error) {
                console.error("Error loading data:", error)
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [])

    const getOrderServices = (orderId: string) => {
        return orderServices.filter((os) => os.order_id === orderId)
    }

    const addOrderService = async (orderService: Omit<OrderServiceType, "order_service_id">) => {
        try {
            const newOrderService = await OrderService.addOrderService(orderService)
            setOrderServices((prev) => [...prev, newOrderService])
            await OrderService.updateOrderTotal(orderService.order_id)

            // Refresh orders to get updated total
            const updatedOrders = await OrderService.getOrders()
            setOrders(updatedOrders)
        } catch (error) {
            console.error("Error adding order service:", error)
        }
    }

    const updateOrderService = async (orderServiceId: string, updates: Partial<OrderServiceType>) => {
        try {
            const updatedOrderService = await OrderService.updateOrderService(orderServiceId, updates)
            setOrderServices((prev) => prev.map((os) => (os.order_service_id === orderServiceId ? updatedOrderService : os)))

            const orderService = orderServices.find((os) => os.order_service_id === orderServiceId)
            if (orderService) {
                await OrderService.updateOrderTotal(orderService.order_id)
                const updatedOrders = await OrderService.getOrders()
                setOrders(updatedOrders)
            }
        } catch (error) {
            console.error("Error updating order service:", error)
        }
    }

    const deleteOrderService = async (orderServiceId: string) => {
        try {
            const orderService = orderServices.find((os) => os.order_service_id === orderServiceId)
            await OrderService.deleteOrderService(orderServiceId)
            setOrderServices((prev) => prev.filter((os) => os.order_service_id !== orderServiceId))

            if (orderService) {
                await OrderService.updateOrderTotal(orderService.order_id)
                const updatedOrders = await OrderService.getOrders()
                setOrders(updatedOrders)
            }
        } catch (error) {
            console.error("Error deleting order service:", error)
        }
    }

    const bookAdditionalHours = async (orderId: string, hours: number, pricePerHour: number) => {
        try {
            await OrderService.bookAdditionalHours(orderId, hours, pricePerHour)
            const updatedOrders = await OrderService.getOrders()
            setOrders(updatedOrders)
        } catch (error) {
            console.error("Error booking additional hours:", error)
        }
    }

    const stats = {
        totalOrders: orders.length,
        pendingOrders: orders.filter((o) => o.status_payment === "pending").length,
        paidOrders: orders.filter((o) => o.status_payment === "paid").length,
        totalRevenue: orders.filter((o) => o.status_payment === "paid").reduce((sum, o) => sum + o.total_amount, 0),
    }

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50 pt-16 pl-64">
                <Sidebar />
                <div className="container mx-auto p-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-lg">Đang tải...</div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 pt-16 pl-64">
            <Sidebar />
            <div className="container mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Quản lý đơn hàng</h1>
                        <p className="text-gray-500">Quản lý đơn hàng và dịch vụ của khách hàng</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Vai trò:</span>
                        <select
                            value={currentUser.role}
                            onChange={(e) => setCurrentUser((prev) => ({ ...prev, role: e.target.value as "admin" | "user" }))}
                            className="p-2 border border-gray-300 rounded w-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="admin">Admin</option>
                            <option value="user">User</option>
                        </select>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
                        <div className="p-4 flex flex-row items-center justify-between">
                            <h3 className="text-sm font-medium">Tổng đơn hàng</h3>
                            <MdShoppingCart className="h-4 w-4 text-gray-500" />
                        </div>
                        <div className="p-4">
                            <div className="text-2xl font-bold">{stats.totalOrders}</div>
                        </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
                        <div className="p-4 flex flex-row items-center justify-between">
                            <h3 className="text-sm font-medium">Chờ thanh toán</h3>
                            <MdAccessTime className="h-4 w-4 text-gray-500" />
                        </div>
                        <div className="p-4">
                            <div className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</div>
                        </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
                        <div className="p-4 flex flex-row items-center justify-between">
                            <h3 className="text-sm font-medium">Đã thanh toán</h3>
                            <MdPeople className="h-4 w-4 text-gray-500" />
                        </div>
                        <div className="p-4">
                            <div className="text-2xl font-bold text-green-600">{stats.paidOrders}</div>
                        </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
                        <div className="p-4 flex flex-row items-center justify-between">
                            <h3 className="text-sm font-medium">Tổng doanh thu</h3>
                            <MdAttachMoney className="h-4 w-4 text-gray-500" />
                        </div>
                        <div className="p-4">
                            <div className="text-2xl font-bold">{stats.totalRevenue.toLocaleString("vi-VN")}đ</div>
                        </div>
                    </div>
                </div>

                {/* User Role Info */}
                <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Đang đăng nhập với vai trò:</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span
                                        className={`px-2 py-1 rounded text-xs font-medium ${currentUser.role === "admin" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"
                                            }`}
                                    >
                                        {currentUser.role === "admin" ? "Quản trị viên" : "Người dùng"}
                                    </span>
                                    <span className="text-sm">{currentUser.name}</span>
                                </div>
                            </div>
                            <div className="text-sm text-gray-500">
                                {currentUser.role === "admin"
                                    ? "Có thể thêm/sửa/xóa dịch vụ và gia hạn giờ cho tất cả đơn hàng"
                                    : "Chỉ có thể chỉnh sửa đơn hàng chưa thanh toán"}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Orders List */}
                <OrderList
                    orders={orders}
                    orderServices={orderServices}
                    services={services}
                    user={currentUser}
                    getOrderServices={getOrderServices}
                    onAddService={addOrderService}
                    onUpdateService={updateOrderService}
                    onDeleteService={deleteOrderService}
                    onBookExtension={bookAdditionalHours}
                />
            </div>
        </div>
    )
}