import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./features/posts/Home";
import Auth from "./features/auth/Auth";
import CreatePost from "./pages/CreatePost";
import EditPost from "./pages/EditPost";

import store from "./app/store";
import { Provider } from "react-redux";

const routes = createBrowserRouter([
  {
    element: <Navbar />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/create",
        element: <CreatePost />,
      },
      {
        path: "/edit/:id",
        element: <EditPost />,
      },
    ],
  },
  {
    path: "/auth",
    element: <Auth />,
  },
]);

export default function App() {
  return (
    <>
      <Provider store={store}>
        <RouterProvider router={routes} />
      </Provider>
    </>
  );
}
