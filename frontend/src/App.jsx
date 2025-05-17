import { BrowserRouter, Routes, Route} from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Home from "./components/Home";
import Header from "./components/Header";


function Layout(Outlet) {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={Layout(Home)} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={Layout(Dashboard)} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
