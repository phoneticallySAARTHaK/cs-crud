export namespace swApi {
  export type ReadRequest =
    | { type: "one"; id: string }
    | { type: "count"; q: string; perPage: number }
    | { type: "all"; q: string; page: number; perPage: number };
}
