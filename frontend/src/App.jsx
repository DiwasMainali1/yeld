import Login from "./components/Login";
import Register from "./components/Register"
import {  BrowserRouter as Router,  Routes, Route} from "react-router-dom";


function App() {

  return (
    <Router>
        <div className="m-0">
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Routes>
        </div>
    </Router>
  )
}

export default App
