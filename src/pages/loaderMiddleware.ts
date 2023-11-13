import { redirect } from "react-router-dom";
import { api } from "../api";
import { UserData } from "../types";
import { routes } from "./routes";

export function loaderMiddleware(): UserData {
  const user = api.ensureUser();
  if (!user) throw redirect(`/${routes.login}`);
  return user;
}
