import { createBrowserRouter, Outlet } from "react-router";
import UnitListingPage from "./pages/UnitListingPage";
import UnitDetailPage from "./pages/UnitDetailPage";
import "react-day-picker/dist/style.css";

function App() {
  return (
    <>
      <Outlet />
    </>
  );
}

export const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <UnitListingPage />,
      },
      {
        path: "/:unitId",
        element: <UnitDetailPage />,
      },
      {
        path: "/paymentComplete",
        element: <h1>ThankYou</h1>,
      },
    ],
  },
]);

export default App;
