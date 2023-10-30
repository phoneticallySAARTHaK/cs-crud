import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

export const Component = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname !== "/") return;

    const isLoggedIn = true;

    navigate(isLoggedIn ? "/home" : "/login", { replace: true });
  }, [location.pathname]);
  return <Outlet />;
};
