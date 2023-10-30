import { swApi } from "../serviceWorker/swTypes";

export namespace api {
  export type Order = {
    id: string;
    customer_name: string;
    customer_email: string;
    product: string;
    quantity: number;
  };

  function makeReadURL(params: swApi.ReadRequest) {
    const url = new URL(`${window.origin}/api`);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, `${v}`));
    return url;
  }

  export type FetchOrderRequest = Parameters<typeof fetchOrders>;
  export function fetchOrders(
    q: string,
    page: number = 1,
    perPage: number = 10,
  ): Promise<Order[]> {
    const params: Extract<swApi.ReadRequest, { type: "all" }> = {
      type: "all",
      page,
      perPage,
      q,
    };
    return fetch(makeReadURL(params)).then((r) => r.json());
  }

  export function fetchOrderByID(id: string): Promise<Order> {
    const params: Extract<swApi.ReadRequest, { type: "one" }> = {
      type: "one",
      id,
    };
    return fetch(makeReadURL(params)).then((r) => r.json());
  }

  export type CountRequest = Parameters<typeof fetchPageCount>;
  export type CountResponse = { count: number };
  export async function fetchPageCount(
    q: string,
    perPage: number,
  ): Promise<CountResponse> {
    const params: Extract<swApi.ReadRequest, { type: "count" }> = {
      type: "count",
      perPage,
      q,
    };
    return fetch(makeReadURL(params)).then((r) => r.json());
  }

  export type DeleteResponse = {};
  export type DeleteRequest = { id: string };
  export function deleteOrderByID(
    data: DeleteRequest,
  ): Promise<DeleteResponse> {
    return fetch("/api", {
      body: JSON.stringify(data),
      headers: [["Content-Type", "application/json"]],
      method: "DELETE",
    }).then((r) => r.json());
  }

  export type UpdateResponse = { id: string };
  export type UpdateRequest = Order;
  export function updateOrder(data: UpdateRequest) {
    return fetch("/api", {
      body: JSON.stringify(data),
      headers: [["Content-Type", "application/json"]],
      method: "PUT",
    }).then((r) => r.json());
  }

  export type CreateResponse = { id: string };
  export type CreateRequest = Order;
  export function createOrder(data: CreateRequest) {
    return fetch("/api", {
      body: JSON.stringify(data),
      headers: [["Content-Type", "application/json"]],
      method: "POST",
    }).then((r) => r.json());
  }
}
