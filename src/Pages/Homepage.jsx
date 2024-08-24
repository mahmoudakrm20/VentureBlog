import { useAuth } from "../contexts/authContext";
import { Link } from "react-router-dom";
import Posts from "../Components/Posts";
import {
  faFacebook,
  faTwitter,
  faInstagram,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Homepage() {
  const { userLoggedIn } = useAuth();

  return (
    <div className="bg-gray-100 min-h-screen relative">
      <main className="container mx-auto flex flex-col md:flex-row px-4 md:px-0">
        {/* Sidebar */}
        <aside className="w-full md:max-w-xs lg:max-w-sm bg-white p-6 rounded-lg shadow-md md:mr-14 mt-24 md:sticky sm:top-0 md:top-24 left-0 md:left-8 lg:left-16 h-fit">
          <div className="text-center mb-6">
            <img
              src="/venture-1-logo-png-transparent.png"
              alt="Profile"
              className="w-40 h-40 mx-auto rounded-full border-4 border-gray-200"
            />
            <h2 className="text-2xl font-semibold text-gray-800 mt-4">
              Venture Blog
            </h2>
            <p className="text-gray-500">Photography & Stories</p>
          </div>

          <p className="text-gray-600 mb-6">
            Welcome to Venture, a visual journey through the lens of
            photography. Our blog shares breathtaking photographs that tell
            unique stories and capture the essence of moments, places, and
            people.
          </p>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Follow Us
            </h3>
            <div className="flex justify-center space-x-4">
              <a href="#" className="text-gray-500 hover:text-blue-600">
                <FontAwesomeIcon icon={faFacebook} size="2x" />
              </a>
              <a href="#" className="text-gray-500 hover:text-blue-400">
                <FontAwesomeIcon icon={faTwitter} size="2x" />
              </a>
              <a href="#" className="text-gray-500 hover:text-pink-600">
                <FontAwesomeIcon icon={faInstagram} size="2x" />
              </a>
              <a href="#" className="text-gray-500 hover:text-red-600">
                <FontAwesomeIcon icon={faYoutube} size="2x" />
              </a>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Newsletter
            </h3>
            <p className="text-gray-600 mb-4">
              Get the latest updates and articles directly in your inbox.
            </p>
            <form className="flex flex-col">
              <input
                type="email"
                placeholder="Your email"
                className="w-full p-2 mb-4 text-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300"
              >
                Subscribe
              </button>
            </form>
          </div>
        </aside>

        {/* Main Content */}
        <section className="w-full max-w-2xl m-auto mt-10 lg:mt-24 flex flex-col items-center">
          <div className="w-full">
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
