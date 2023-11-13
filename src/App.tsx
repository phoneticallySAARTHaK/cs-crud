import { useLayoutEffect } from "react";
import {
  RouterProvider,
  createBrowserRouter,
  redirect,
} from "react-router-dom";
import { api } from "./api";
import * as Account from "./pages/Account";
import * as Action from "./pages/Action";
import { ErrorBoundary } from "./pages/Error";
import * as Home from "./pages/Home";
import * as Login from "./pages/Login";
import * as Logout from "./pages/Logout";
import * as Root from "./pages/Root";
import { loaderMiddleware } from "./pages/loaderMiddleware";
import { routes } from "./pages/routes";

const router = createBrowserRouter([
  {
    path: routes.root,
    Component: Root.Component,

    children: [
      {
        ErrorBoundary: ErrorBoundary,
        children: [
          {
            path: routes.login,
            Component: Login.Component,
            loader: () => {
              try {
                loaderMiddleware();
                return redirect(`/${routes.home}`);
              } catch {
                return null;
              }
            },
          },
          {
            path: routes.logout,
            action: Logout.action,
          },
          {
            path: routes.home,
            Component: Home.Component,
            loader: (...args) => {
              loaderMiddleware();
              return Home.loader(...args);
            },
            action: Home.action,
            children: [
              {
                path: routes.action_id,
                loader: (...args) => {
                  loaderMiddleware();
                  return Action.loader(...args);
                },
                Component: Action.Component,
              },
            ],
          },
          {
            path: routes.account,
            Component: Account.Component,
            loader: () => {
              loaderMiddleware();
              return Account.loader();
            },
          },
        ],
      },
    ],
  },
]);

function App() {
  // required to prevent race condition
  useLayoutEffect(() => {
    window.handleCredentialResponse = api.login;

    window.googleScriptLoaded = new Promise<boolean>((res) => {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      document.head.appendChild(script);

      script.onload = () => {
        google.accounts.id.initialize({
          client_id: import.meta.env.VITE_G_CLIENT_ID,
          callback: window.handleCredentialResponse,
        });
        res(true);
      };

      script.onerror = (e) => {
        console.log("load error", e);
        res(false);
      };
    });
  }, []);

  return <RouterProvider router={router} />;
}

export default App;
