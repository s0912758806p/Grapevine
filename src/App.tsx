import { Provider } from "react-redux";
import { Outlet } from "react-router-dom";
import { store } from "./store";
import AppLayout from "./components/AppLayout";
import AntConfigProvider from "./components/AntConfigProvider";
// App.scss is now imported via main.scss
function App() {
  return (
    <Provider store={store}>
      <AntConfigProvider>
        <AppLayout>
          <Outlet />
        </AppLayout>
      </AntConfigProvider>
    </Provider>
  );
}
export default App;
