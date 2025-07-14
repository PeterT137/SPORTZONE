import type { Order, OrderServiceType, Service } from "../interface"

// Mock data - replace with actual API calls
const mockOrders: Order[] = [
  {
    order_id: "1",
    customer_id: "cust_1",
    fac_id: "fac_1",
    booking_id: "book_1",
    guest_name: "Nguyễn Văn A",
    guest_phone: "0123456789",
    total_amount: 500000,
    content_payment: "Thanh toán dịch vụ",
    status_payment: "paid",
    create_at: "2024-01-15T10:00:00Z",
  },
  {
    order_id: "2",
    customer_id: "cust_2",
    fac_id: "fac_1",
    booking_id: "book_2",
    guest_name: "Trần Thị B",
    guest_phone: "0987654321",
    total_amount: 750000,
    content_payment: "Thanh toán dịch vụ",
    status_payment: "pending",
    create_at: "2024-01-16T14:30:00Z",
  },
]

const mockOrderServices: OrderServiceType[] = [
  {
    order_service_id: "1",
    order_id: "1",
    service_id: "srv_1",
    quantity: 2,
    price: 200000,
    service_name: "Massage thư giãn",
    service_description: "Massage toàn thân 60 phút",
  },
  {
    order_service_id: "2",
    order_id: "1",
    service_id: "srv_2",
    quantity: 1,
    price: 300000,
    service_name: "Spa chăm sóc da",
    service_description: "Chăm sóc da mặt cao cấp",
  },
]

const mockServices: Service[] = [
  {
    service_id: "srv_1",
    name: "Massage thư giãn",
    description: "Massage toàn thân 60 phút",
    price: 200000,
    duration: 60,
  },
  {
    service_id: "srv_2",
    name: "Spa chăm sóc da",
    description: "Chăm sóc da mặt cao cấp",
    price: 300000,
    duration: 90,
  },
  {
    service_id: "srv_3",
    name: "Tắm hơi",
    description: "Tắm hơi thảo dược",
    price: 150000,
    duration: 45,
  },
]

export class OrderService {
  static async getOrders(): Promise<Order[]> {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockOrders), 500)
    })
  }

  static async getOrderServices(): Promise<OrderServiceType[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockOrderServices), 500)
    })
  }

  static async getServices(): Promise<Service[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockServices), 500)
    })
  }

  static async addOrderService(orderService: Omit<OrderServiceType, "order_service_id">): Promise<OrderServiceType> {
    const newOrderService: OrderServiceType = {
      ...orderService,
      order_service_id: `os_${Date.now()}`,
    }
    mockOrderServices.push(newOrderService)
    return newOrderService
  }

  static async updateOrderService(orderServiceId: string, updates: Partial<OrderServiceType>): Promise<OrderServiceType> {
    const index = mockOrderServices.findIndex((os) => os.order_service_id === orderServiceId)
    if (index !== -1) {
      mockOrderServices[index] = { ...mockOrderServices[index], ...updates }
      return mockOrderServices[index]
    }
    throw new Error("Order service not found")
  }

  static async deleteOrderService(orderServiceId: string): Promise<void> {
    const index = mockOrderServices.findIndex((os) => os.order_service_id === orderServiceId)
    if (index !== -1) {
      mockOrderServices.splice(index, 1)
    }
  }

  static async updateOrderTotal(orderId: string): Promise<void> {
    const orderServices = mockOrderServices.filter((os) => os.order_id === orderId)
    const total = orderServices.reduce((sum, os) => sum + os.price * os.quantity, 0)

    const orderIndex = mockOrders.findIndex((order) => order.order_id === orderId)
    if (orderIndex !== -1) {
      mockOrders[orderIndex].total_amount = total
    }
  }

  static async bookAdditionalHours(orderId: string, hours: number, pricePerHour: number): Promise<void> {
    const additionalCost = hours * pricePerHour
    const orderIndex = mockOrders.findIndex((order) => order.order_id === orderId)
    if (orderIndex !== -1) {
      mockOrders[orderIndex].total_amount += additionalCost
    }
  }
}