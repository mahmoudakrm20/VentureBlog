import { Link } from "react-router-dom";
import { useAuth } from "../contexts/authContext";
import { doSignOut } from "../firebase/auth";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { userLoggedIn, currentUser } = useAuth();
  const [profilePhoto, setProfilePhoto] = useState(currentUser?.photoURL);

  useEffect(() => {
    if (currentUser?.photoURL) {
      setProfilePhoto(currentUser.photoURL);
    }
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await doSignOut();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <header className="bg-white shadow-md py-4 z-50">
      <div className="container mx-auto flex justify-between items-center px-6 md:px-8">
        <h1 className="text-4xl font-semibold text-gray-800 cursor-pointer font-serif">
          <Link to="/">Venture</Link>
        </h1>
        <nav className="flex items-center space-x-6">
          {userLoggedIn ? (
            <>
              {profilePhoto && (
                <img
                  src={profilePhoto}
                  alt="User profile"
                  className="w-10 h-10 rounded-full border-2 border-gray-300 shadow-md"
                />
              )}
              <span className="text-base font-medium text-gray-800 ml-3 font-sans">
                {currentUser?.displayName}
              </span>
              <button
                onClick={handleLogout}
                className="text-base font-medium text-red-600 hover:text-red-800 transition-colors font-sans"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="text-base font-medium text-blue-600 hover:text-blue-800 transition-colors font-sans"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
