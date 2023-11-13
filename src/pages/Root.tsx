import { useEffect } from "react";
import {
  LoaderFunctionArgs,
  Outlet,
  redirect,
  useLocation,
  useNavigate,
  useNavigation,
} from "react-router-dom";
import { loaderMiddleware } from "./loaderMiddleware";
import { routes } from "./routes";

export const Component = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const navigation = useNavigation();

  useEffect(() => {
    const className = "loading-blur";
    const loadingId = "loading-div";
    const main = document.getElementById("root")?.querySelector("main");
    if (!main) return;

    if (navigation.state !== "idle") {
      main.style.position = "relative";
      const div = document.createElement("div");
      div.classList.add(className);
      div.id = loadingId;
      main.appendChild(div);
    } else {
      document.getElementById(loadingId)?.remove();
    }
  }, [navigation.state]);

  useEffect(() => {
    if (location.pathname !== routes.root) return;

    try {
      loaderMiddleware();
      navigate(`/${routes.home}`, { replace: true });
    } catch {
      navigate(`/${routes.login}`, { replace: true });
    }
  }, [location.pathname]);

  return <Outlet />;
};

export async function loader({
  request,
}: LoaderFunctionArgs): Promise<null | Response> {
  const url = new URL(request.url);

  if (url.pathname !== routes.root) return null;

  try {
    loaderMiddleware();
    return redirect(`/${routes.home}`);
  } catch {
    return redirect(`/${routes.login}`);
  }
}
