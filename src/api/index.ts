import { FormMethod } from "react-router-dom";
import { swApi } from "../serviceWorker/swTypes";

type JsonObject = {
  [Key in string]: JsonValue;
} & {
  [Key in string]?: JsonValue | undefined;
};
type JsonArray = JsonValue[] | readonly JsonValue[];
type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonArray;
type fetchArgs = Parameters<typeof fetch>;

export namespace api {
  export type BaseAPIPath = "/api";

  export const baseAPIPath = "/api" satisfies BaseAPIPath;

  type Init = Omit<Exclude<fetchArgs[1], undefined>, "method" | "body"> &
    (
      | {
          method: Exclude<Uppercase<FormMethod>, "GET">;
          body: JsonValue;
        }
      | {
          method: Extract<Uppercase<FormMethod>, "GET">;
          body: undefined;
        }
    );

  /**
   * A fetch wrapper, with added type safety. Adds content-type header by default, and stringifies body.
   * @param input
   * @param init
   * @returns JSON parsed response body
   */
  async function fetchWrapper(input: fetchArgs[0], init?: Init) {
    const method =
      (input instanceof Request
        ? (input.method as Init["method"])
        : undefined) ??
      init?.method ??
      "GET";

    const body =
      (input instanceof Request ? await input.text() : undefined) || init?.body;

    const shouldNotSendBody = method === "GET" || !body;

    return fetch(input, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...Object.fromEntries(new Headers(init?.headers).entries()),
      },
      body: shouldNotSendBody ? undefined : JSON.stringify(init?.body),
    }).then((r) => r.json());
  }

  export type Order = {
    id: string;
    customer_name: string;
    customer_email: string;
    product: string;
    quantity: number;
  };

  /**
   * Helper function to create a valid read api URL
   * @param params ReadRequest Params object
   * @returns
   */
  function makeReadURL(params: swApi.ReadRequest) {
    const url = new URL(`${window.origin}${baseAPIPath}`);
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
    return fetchWrapper(makeReadURL(params));
  }

  export function fetchOrderByID(id: string): Promise<Order> {
    const params: Extract<swApi.ReadRequest, { type: "one" }> = {
      type: "one",
      id,
    };
    return fetchWrapper(makeReadURL(params));
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
    return fetchWrapper(makeReadURL(params));
  }

  export type DeleteResponse = {};
  export type DeleteRequest = { id: string };
  export function deleteOrderByID(
    body: DeleteRequest,
  ): Promise<DeleteResponse> {
    return fetchWrapper(baseAPIPath, { body, method: "DELETE" });
  }

  export type UpdateResponse = { id: string };
  export type UpdateRequest = Order;
  export function updateOrder(body: UpdateRequest) {
    return fetchWrapper(baseAPIPath, {
      body,
      method: "PUT",
    });
  }

  export type CreateResponse = { id: string };
  export type CreateRequest = Order;
  export function createOrder(body: CreateRequest) {
    return fetchWrapper(baseAPIPath, {
      body,
      method: "POST",
    });
  }
}
