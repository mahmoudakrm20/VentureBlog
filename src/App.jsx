import "./App.css";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Homepage from "./Pages/Homepage";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import AddPost from "./Pages/AddPost";
import EditPost from "./Pages/EditPost";
import { AuthProvider } from "./contexts/authContext";
import Spinner from "./Components/Spinner";
import { useState, useEffect } from "react";

function App() {
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [location]);

  return (
    <AuthProvider>
      {loading ? (
        <Spinner />
      ) : (
        <div className="relative">
          <Navbar />
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/addpost" element={<AddPost />} />
            <Route path="/editpost/:id" element={<EditPost />} />
          </Routes>
        </div>
      )}
    </AuthProvider>
  );
}

export default App;
