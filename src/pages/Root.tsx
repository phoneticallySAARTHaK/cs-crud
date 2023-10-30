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
    const id = "loading_blur";
    if (navigation.state === "loading") {
      const blur = document.createElement("div");
      blur.id = id;
      blur.style.top = "0";
      blur.style.right = "0";
      blur.style.left = "0";
      blur.style.bottom = "0";
      blur.style.position = "fixed";
      blur.style.pointerEvents = "none";
      blur.style.isolation = "isolate";
      blur.style.zIndex = "9999";

      blur.style.backdropFilter = "blur(1px)";
      document.body.appendChild(blur);
    } else {
      document.getElementById(id)?.remove();
    }
  }, [navigation.state]);

  useEffect(() => {
    if (location.pathname !== "/") return;

    const isLoggedIn = true;

    navigate(isLoggedIn ? "/home" : "/login", { replace: true });
  }, [location.pathname]);

  return <Outlet />;
};
