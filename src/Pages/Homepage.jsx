import { useAuth } from "../contexts/authContext";
import { Link } from "react-router-dom";
import Posts from "../Components/Posts";
export default function Homepage() {
  const { userLoggedIn } = useAuth();

  return (
    <div className="bg-gray-100 min-h-screen relative">
      <main className="container mx-auto flex flex-col md:flex-row  px-4 md:px-0">
        {/* Sidebar */}
        <aside className="w-full sm:w1/1 md:w-1/2 lg:w-1/4 bg-white p-6 rounded-lg shadow-md lg:ml-8 mb-6 md:mb-0 h-fit mt-28 ">
          <div className="text-center mb-4">
            <img
              src="/venture-1-logo-png-transparent.png"
              alt="Profile"
              className="w-40 h-40  mx-auto"
            />
          </div>
          <p className="text-gray-600 mb-4">
            Welcome to Venture, a visual journey through the lens of
            photography. Our blog is dedicated to sharing breathtaking
            photographs that tell unique stories and capture the essence of
            moments, places, and people.
          </p>

          <p className="text-center text-gray-500 mt-4"></p>
        </aside>

        {/* Main Content */}
        <section className="w-full sm:w-1/1 base:w-2/4 lg:w-2/4 md:ml-16 m-auto flex flex-col items-center">
          <div className="w-full max-w-5xl sm:mt-2 md:mt-28">
            <Posts />
          </div>
        </section>
      </main>
      {userLoggedIn && (
        <Link
          to="/addpost"
          className="fixed bottom-14 right-6 md:right-14 bg-blue-500 text-white flex items-center justify-center w-16 h-16 rounded-full shadow-lg text-3xl hover:bg-blue-600 transition duration-300 transform hover:scale-105 active:scale-95"
        >
          +
        </Link>
      )}
    </div>
  );
}
