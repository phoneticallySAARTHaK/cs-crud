import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { api } from "./api";
import { Component as Action, loader as ActionLoader } from "./pages/Action";
import { ErrorBoundary } from "./pages/Error";
import * as Home from "./pages/Home";
import { Component as Root } from "./pages/Root";
import { rootLoader } from "./pages/loaders";

const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    loader: rootLoader,
    children: [
      {
        ErrorBoundary: ErrorBoundary,
        children: [
          {
            path: "home",
            Component: Home.Component,
            loader: Home.loader,
            action: async ({ request }) => {
              const body = await request.json();

              switch (request.method) {
                case "DELETE":
                  await api.deleteOrderByID(body);
                  break;

                case "PUT":
                  await api.updateOrder(body);
                  break;

                case "POST":
                  await api.createOrder(body);
              }

              return null;
            },
            children: [
              {
                path: ":action/:id?",
                loader: ActionLoader,
                Component: Action,
              },
            ],
          },
        ],
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
