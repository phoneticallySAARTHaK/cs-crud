import { LoaderFunctionArgs, redirect } from "react-router-dom";
import { api } from "../api";

export type RootLoaderData = { page_count: number };

export async function rootLoader({
  request,
}: LoaderFunctionArgs): Promise<null | Response> {
  const isLoggedIn = true;
  const url = new URL(request.url);

  if (url.pathname !== "/") return null;

  return redirect(isLoggedIn ? "/home" : "/login");
}

export async function resultLoader({}: LoaderFunctionArgs): Promise<
  api.Order[]
> {
  // const url = new URL(request.url);

  // const res = await api.fetchCars(
  //   url.searchParams.get("q") ?? "",
  //   url.searchParams.get("page") ?? "1",
  //   isFavorite,
  // );

  // if (!res || !Array.isArray(res) || !res.length)
  //   throw "No data available on this page.";

  return [];
}
