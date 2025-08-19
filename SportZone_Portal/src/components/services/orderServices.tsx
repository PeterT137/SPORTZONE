// services/orderServices.ts
import type { Order, OrderServiceType, Service } from "../interface";

const API_URL = "https://localhost:7057";

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const getString = (v: unknown, fallback = ""): string => {
  if (typeof v === "string") return v;
  if (v == null) return fallback;
  return String(v);
};

const getNumber = (v: unknown, fallback = 0): number => {
  if (typeof v === "number") return v;
  const n = Number(v as unknown as string);
  return Number.isFinite(n) ? n : fallback;
};

// NOTE: There is no list-all Orders endpoint on backend. getOrders() remains a mock until API exists.
const mockOrders: Order[] = [];

export class OrderService {
  static async getOrders(): Promise<Order[]> {
    return mockOrders;
  }

  static async getOrderServices(orderId: string): Promise<OrderServiceType[]> {
    const numericId = Number(orderId);
    if (Number.isNaN(numericId)) return [];
    const res = await fetch(
      `${API_URL}/api/Service/order/${numericId}/services`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      }
    );
    if (!res.ok) return [];
    const json: unknown = await res.json();
    const container = json as Record<string, unknown>;
    const dataArray: unknown = container.data ?? json;
    const arr: Array<Record<string, unknown>> = Array.isArray(dataArray)
      ? (dataArray as Array<Record<string, unknown>>)
      : [];
    return arr.map((it: Record<string, unknown>) => ({
      order_service_id: getString(
        it["orderServiceId"] ?? it["OrderServiceId"] ?? it["id"],
        ""
      ),
      order_id: getString(
        it["orderId"] ?? it["OrderId"] ?? orderId,
        String(orderId)
      ),
      service_id: getString(it["serviceId"] ?? it["ServiceId"], ""),
      quantity: getNumber(it["quantity"] ?? it["Quantity"], 0),
      price: getNumber(it["price"] ?? it["Price"], 0),
      service_name: getString(
        it["serviceName"] ?? it["ServiceName"],
        undefined as unknown as string
      ),
      service_description: undefined,
    }));
  }

  static async getServices(): Promise<Service[]> {
    const res = await fetch(`${API_URL}/api/Service/GetAllService`, {
      method: "GET",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    });
    if (!res.ok) return [];
    const json: unknown = await res.json();
    const container = json as Record<string, unknown>;
    const dataArray: unknown = container.data ?? json;
    const arr: Array<Record<string, unknown>> = Array.isArray(dataArray)
      ? (dataArray as Array<Record<string, unknown>>)
      : [];
    const mapped: Service[] = arr.map((s: Record<string, unknown>) => {
      const name = getString(s["serviceName"] ?? s["ServiceName"], "");
      return {
        service_id: getString(s["serviceId"] ?? s["ServiceId"], ""),
        name,
        description: getString(s["description"] ?? s["Description"], ""),
        price: getNumber(s["price"] ?? s["Price"], 0),
        duration: 60,
      };
    });
    return mapped;
  }

  static async addOrderService(
    orderService: Omit<OrderServiceType, "order_service_id">
  ): Promise<OrderServiceType> {
    const payload = {
      orderId: Number(orderService.order_id),
      serviceId: Number(orderService.service_id),
      quantity: Number(orderService.quantity ?? 1),
    };
    const res = await fetch(`${API_URL}/api/Service/order/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Thêm dịch vụ thất bại");
    }
    const json: unknown = await res.json();
    const container: Record<string, unknown> =
      (json as Record<string, unknown>) || {};
    const it: Record<string, unknown> =
      (container.data as Record<string, unknown>) ?? container;
    return {
      order_service_id: getString(
        it["orderServiceId"] ?? it["OrderServiceId"] ?? Date.now().toString(),
        Date.now().toString()
      ),
      order_id: getString(
        it["orderId"] ?? it["OrderId"] ?? orderService.order_id,
        orderService.order_id
      ),
      service_id: getString(
        it["serviceId"] ?? it["ServiceId"] ?? orderService.service_id,
        orderService.service_id
      ),
      quantity: getNumber(
        it["quantity"] ?? it["Quantity"] ?? orderService.quantity ?? 1,
        1
      ),
      price: getNumber(
        it["price"] ?? it["Price"] ?? orderService.price ?? 0,
        0
      ),
      service_name: getString(
        it["serviceName"] ?? it["ServiceName"],
        undefined as unknown as string
      ),
      service_description: undefined,
    };
  }

  static async updateOrderService(
    orderServiceId: string,
    updates: Partial<OrderServiceType>
  ): Promise<OrderServiceType> {
    const payload: Record<string, unknown> = {};
    if (typeof updates.quantity === "number")
      payload.quantity = updates.quantity;
    const idNum = Number(orderServiceId);
    const res = await fetch(
      `${API_URL}/api/Service/order/${idNum}/update/Service/Quantity`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(payload),
      }
    );
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Cập nhật số lượng thất bại");
    }
    const json: unknown = await res.json();
    const container = json as Record<string, unknown>;
    const it = (container.data ?? json) as Record<string, unknown>;
    return {
      order_service_id: getString(
        it["orderServiceId"] ?? it["OrderServiceId"] ?? orderServiceId,
        orderServiceId
      ),
      order_id: getString(it["orderId"] ?? it["OrderId"] ?? "", ""),
      service_id: getString(it["serviceId"] ?? it["ServiceId"] ?? "", ""),
      quantity: getNumber(
        it["quantity"] ?? it["Quantity"] ?? updates.quantity ?? 1,
        1
      ),
      price: getNumber(it["price"] ?? it["Price"] ?? 0, 0),
      service_name: getString(
        it["serviceName"] ?? it["ServiceName"],
        undefined as unknown as string
      ),
      service_description: undefined,
    };
  }

  static async deleteOrderService(orderServiceId: string): Promise<void> {
    const idNum = Number(orderServiceId);
    const res = await fetch(`${API_URL}/api/Service/order/${idNum}/remove`, {
      method: "DELETE",
      headers: { ...getAuthHeaders() },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Xóa dịch vụ thất bại");
    }
  }

  static async updateOrderTotal(orderId: string): Promise<void> {
    // No-op: backend computes totals; call getOrderById from OrderManager to refresh
    void orderId;
  }

  static async bookAdditionalHours(
    _orderId: string,
    _hours: number,
    _pricePerHour: number
  ): Promise<void> {
    // Avoid linter unused warnings until backend endpoint exists
    void _orderId;
    void _hours;
    void _pricePerHour;
  }

  static async updateOrderPaymentStatus(
    orderId: string,
    status: "pending" | "paid" | "cancelled"
  ): Promise<Order> {
    // No backend endpoint provided; keep local shape update minimal
    return {
      order_id: orderId,
      customer_id: "",
      fac_id: "",
      booking_id: "",
      guest_name: "",
      guest_phone: "",
      total_amount: 0,
      content_payment: "",
      status_payment: status,
      create_at: new Date().toISOString(),
    };
  }
}
