/// <reference lib="webworker" />
import { clientsClaim } from "workbox-core";
import {
  createHandlerBoundToURL,
  matchPrecache,
  precacheAndRoute,
} from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";
import { Strategy } from "workbox-strategies";
import { api } from "../api";
import { swApi } from "./swTypes";

declare const self: ServiceWorkerGlobalScope;

clientsClaim();

precacheAndRoute(self.__WB_MANIFEST);

// Set up App Shell-style routing, so that all navigation requests
// are fulfilled with your index.html shell.
// https://developer.chrome.com/docs/workbox/modules/workbox-routing/#how-to-register-a-navigation-route
registerRoute(
  new NavigationRoute(createHandlerBoundToURL("/index.html"), {
    denylist: [/\/docs*/],
  }),
);

self.addEventListener("message", async (event) => {
  const data = event.data;
  if (!data) return;

  switch (data.type) {
    case "SKIP_WAITING":
      self.skipWaiting();
      break;
  }
});

self.addEventListener("activate", (e) => e.waitUntil(init()));

const dbMeta = {
  dbName: "db",
  osName: "orders",
  keyPath: "id",
} as const;

async function init() {
  const request = indexedDB.open(dbMeta.dbName);

  request.onblocked = (e) => {
    console.error("init blocked");
    (e.target as IDBOpenDBRequest).result?.close();
  };

  request.onupgradeneeded = () => {
    const db = request.result;

    db.onerror = (e) => console.error("Init db error ", e);

    db.createObjectStore(dbMeta.osName, {
      keyPath: dbMeta.keyPath,
    }).transaction.commit();
  };

  request.onsuccess = async () => {
    const db = request.result;
    const transaction = db.transaction(dbMeta.osName, "readonly");

    const req = transaction.objectStore(dbMeta.osName).getAll();

    const [newData, storedData] = await Promise.all([
      matchPrecache("/assets/DummyData.json").then((res) => {
        if (!res) {
          throw res;
        }
        return res.json();
      }) as Promise<api.Order[]>,
      new Promise<api.Order[]>((r) => {
        req.onsuccess = () => {
          r(req.result);
        };
      }),
    ] as const).catch((e) => (console.error("Some error occuered", e), []));

    req.onerror = (e) => {
      console.log("transaction errror", e);
    };

    const newDataMap = new Map(newData.map(({ id, ...data }) => [id, data]));

    const writeTranscation = db.transaction(dbMeta.osName, "readwrite");
    newData.forEach(
      (data) => void writeTranscation.objectStore(dbMeta.osName).put(data),
    );

    storedData
      .filter((data) => {
        !newDataMap.has(data.id);
      })
      .forEach(
        (data) =>
          void writeTranscation.objectStore(dbMeta.osName).delete(data.id),
      );

    writeTranscation.commit();
    db.close();
  };
}

class Create extends Strategy {
  protected async _handle(request: Request): Promise<Response | undefined> {
    try {
      const reqData = await request.json();

      const validatedData = checkValidOrder(reqData);

      const data = await mutationTransaction("add", validatedData);

      return json<typeof data>(data);
    } catch (e) {
      return json<any>({}, 500);
    }
  }
}

class Read extends Strategy {
  protected async _handle(request: Request): Promise<Response | undefined> {
    try {
      const params = parseSearchParams<swApi.ReadRequest>(request.url);

      switch (params.type) {
        case "one": {
          const id = params.id;
          if (!id) throw new Error("Bad request");
          return json<api.Order>(await getOrderFromID(id));
        }

        case "count": {
          const q = (params.q ?? "").toLowerCase();
          const parsedPerPage = parseInt(params.perPage ?? "");
          const perPage = isNaN(parsedPerPage) ? 10 : parsedPerPage;
          return json<api.CountResponse>({
            count: await getQueryCount(q, perPage),
          });
        }

        case "all": {
          const q = (params.q ?? "").toLowerCase();
          const parsedPage = parseInt(params.page ?? "");
          const parsedPerPage = parseInt(params.perPage ?? "");

          const page = isNaN(parsedPage) ? 0 : parsedPage - 1;
          const perPage = isNaN(parsedPerPage) ? 10 : parsedPerPage;

          const data = await queryObjects(q, page, perPage);

          return json<typeof data>(data);
        }

        default:
          throw new Error("bad request");
      }
    } catch (e) {
      return json<any>({}, 500);
    }
  }
}

class Update extends Strategy {
  protected async _handle(request: Request): Promise<Response | undefined> {
    try {
      const reqData = await request.json();
      const validatedData = checkValidOrder(reqData);

      const data = await mutationTransaction("put", validatedData);

      return json<typeof data>(data);
    } catch (e) {
      console.log(e);
      return json<any>({}, 500);
    }
  }
}

class Delete extends Strategy {
  protected async _handle(request: Request) {
    try {
      const reqData = await request.json();

      if (!reqData.id) throw new Error("no ID");

      const data = await mutationTransaction("delete", reqData.id);

      return json<typeof data>(data);
    } catch (e) {
      return json<any>({}, 500);
    }
  }
}

const baseAPIPath = "/api" satisfies api.BaseAPIPath;

function apiRouteMatcher({ url }: { url: URL }) {
  return url.pathname.startsWith(baseAPIPath);
}

registerRoute(apiRouteMatcher, new Create(), "POST");
registerRoute(apiRouteMatcher, new Read(), "GET");
registerRoute(apiRouteMatcher, new Update(), "PUT");
registerRoute(apiRouteMatcher, new Delete(), "DELETE");

const requiredKeys: (keyof api.Order)[] = [
  "customer_email",
  "customer_name",
  "id",
  "product",
  "quantity",
];

function checkValidOrder(o: object) {
  const keys = Object.keys(o);
  if (!requiredKeys.every((k) => keys.includes(k)))
    throw new Error("bad request");

  const { customer_email, customer_name, id, product, quantity } =
    o as api.Order;

  return { customer_email, customer_name, id, product, quantity };
}

async function getTransaction(mode: IDBTransactionMode) {
  return new Promise<IDBTransaction>((res, rej) => {
    const req = indexedDB.open(dbMeta.dbName);
    req.onerror = (e) => {
      console.log("IDB error", e);
      rej(e);
    };

    req.onsuccess = () => {
      res(req.result.transaction(dbMeta.osName, mode));
    };
  });
}

function json<T = never, U extends T = T>(body: U, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: [["Content-Type", "application/json"]],
  }) as T extends never ? never : Response;
}

async function getOrderFromID(id: string) {
  const transaction = await getTransaction("readonly");
  return new Promise<api.Order>((res, rej) => {
    const req = transaction.objectStore(dbMeta.osName).get(id);

    req.onerror = (e) => {
      console.log("read error", e);
      rej(e);
    };

    req.onsuccess = () => {
      req.result
        ? res(req.result)
        : rej(new Error(`No order with id ${id} found`));
    };
  });
}

function queryMatcher(q: string) {
  return ([k, v]: [string, string | number]) =>
    k !== "id" && `${v}`.toLowerCase().includes(q);
}

async function queryObjects(q: string, page: number, perPage: number) {
  const results: api.Order[] = [];
  let offest = page < 0 ? 0 : page * 10;
  const transaction = await getTransaction("readonly");
  return new Promise<api.Order[]>((res) => {
    const cursorReq = transaction.objectStore(dbMeta.osName).openCursor();

    cursorReq.onsuccess = () => {
      const cursor = cursorReq.result;

      if (!cursor || results.length === perPage) {
        res(results);
        transaction.commit();
        return;
      }

      const value = cursor.value as api.Order;

      let matches = Object.entries(value).find(queryMatcher(q));

      if (!matches) {
        cursor.continue();
        return;
      }

      if (offest !== 0) {
        cursor.continue();
        offest -= 1;
        return;
      }

      results.push(value);
      cursor.continue();
    };
  });
}

async function getQueryCount(q: string, perPage: number) {
  let count = 0;
  const transaction = await getTransaction("readonly");
  return new Promise<number>((res) => {
    const cursorReq = transaction.objectStore(dbMeta.osName).openCursor();

    cursorReq.onsuccess = () => {
      const cursor = cursorReq.result;

      if (!cursor) {
        res(Math.ceil(count / perPage));
        transaction.commit();
        return;
      }

      const value = cursor.value as api.Order;

      let matches = Object.entries(value).find(queryMatcher(q));

      if (!matches) {
        cursor.continue();
        return;
      }

      count++;
      cursor.continue();
    };
  });
}
/** IndexedDB method names */
type MutationMethod = keyof Pick<IDBObjectStore, "add" | "delete" | "put">;

/** Helper type to map C.U.D. operations with request/response types and IndexDB operations */
type MutationMap = {
  [k in MutationMethod as `${k}-res`]: k extends "add"
    ? api.CreateResponse
    : k extends "delete"
    ? api.DeleteResponse
    : api.UpdateResponse;
} & {
  [k in MutationMethod as `${k}-req`]: k extends "add"
    ? api.CreateRequest
    : k extends "delete"
    ? api.DeleteRequest
    : api.UpdateRequest;
};

type ResMap<T extends MutationMethod> = MutationMap[`${T}-res`];
type ReqMap<T extends MutationMethod> = MutationMap[`${T}-req`];

/** Wrapper function for all mutations */
async function mutationTransaction<
  TMethod extends MutationMethod,
  TArg extends ReqMap<TMethod> = ReqMap<TMethod>,
  TRes extends ResMap<TMethod> = ResMap<TMethod>,
>(method: TMethod, argument: TArg): Promise<TRes> {
  const transaction = await getTransaction("readwrite");

  const data = await new Promise<TRes>((res, rej) => {
    const os = transaction.objectStore(dbMeta.osName);
    const func = os[method].bind(os) as (a: typeof argument) => IDBRequest;
    const request = func(argument);

    request.onsuccess = () => {
      res((method === "delete" ? {} : { id: request.result }) as TRes); // Type cast required due to fualty type deduction
    };

    request.onerror = (e) => {
      console.log("write error", e);
      rej(e);
    };
  });
  return data;
}

function parseSearchParams<
  T extends Record<string, string | undefined | number | boolean>,
>(url: string | URL) {
  const urlObj = new URL(url);
  return Object.fromEntries(
    urlObj.searchParams.entries(),
  ) as SearchParamType<T>;
}
/** Casts Object types to Record<string, string> and makes them optional */
type SearchParamType<T> = {
  [k in keyof T]?: T[k] extends string | number | boolean ? `${T[k]}` : never;
};
