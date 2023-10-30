import { useEffect } from "react";
import {
  Outlet,
  useLocation,
  useNavigate,
  useNavigation,
} from "react-router-dom";

export const Component = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const navigation = useNavigation();

  useEffect(() => {
    const className = "loading-blur";
    const loadingId = "loading-div";
    const main = document.getElementById("root")?.querySelector("main");
    if (!main) return;

    if (navigation.state === "loading") {
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
    if (location.pathname !== "/") return;

    const isLoggedIn = true;

    navigate(isLoggedIn ? "/home" : "/login", { replace: true });
  }, [location.pathname]);

  return <Outlet />;
};
