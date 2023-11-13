import { ActionFunction, redirect } from "react-router-dom";
import { api } from "../api";
import { routes } from "./routes";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const hint = formData.get("hint");

  if (typeof hint !== "string") {
    console.error("No hint provided");
    return null;
  }

  try {
    await api.logout(hint);
    return redirect(routes.root);
  } catch (e) {
    const redirectOnError = formData.get("redirectOnError");

    if (typeof redirectOnError !== "string") {
      console.error("no redirect url provided");
      return null;
    }

    return redirect(redirectOnError);
  }
};
