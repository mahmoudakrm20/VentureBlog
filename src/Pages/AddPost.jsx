import { useState } from "react";
import { useAuth } from "../contexts/authContext";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { db, storage } from "../firebase/firebase"; // Correct import
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Link, useNavigate } from "react-router-dom";

const AddPost = () => {
  const { currentUser, userLoggedIn } = useAuth();
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please upload an image.");
      return;
    }

    setUploading(true);

    const fileName = `${Date.now()}_${file.name}`;
    const fileRef = ref(storage, `posts/${fileName}`);

    try {
      await uploadBytes(fileRef, file);
      const fileUrl = await getDownloadURL(fileRef);

      const post = {
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL,
        userId: currentUser.uid,
        imgUrl: fileUrl,
        description,
        createdAt: Timestamp.fromDate(new Date()),
      };

      await addDoc(collection(db, "posts"), post);
      setFile(null);
      setDescription("");
      console.log("Post added successfully!");
    } catch (error) {
      console.error("Error adding post: ", error);
    } finally {
      setUploading(false);
      navigate("/");
    }
  };

  if (!userLoggedIn) {
    return (
      <main className="w-full h-screen flex items-center justify-center bg-gray-100">
        <div className="w-full max-w-md p-8 bg-white shadow-lg border rounded-xl space-y-6 text-center">
          <p className="text-gray-800 font-bold text-xl mb-4">
            You need to be logged in to post.
          </p>
          <Link
            to="/login"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md p-8 bg-white shadow-lg border rounded-xl space-y-6"
      >
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Image Upload
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:border-blue-500 transition duration-300"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Post Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:border-blue-500 transition duration-300"
          />
        </div>
        <button
          type="submit"
          className={`w-full px-4 py-2 text-white font-semibold rounded-lg ${
            uploading
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-transform duration-150 transform active:scale-95"
          }`}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Add Post"}
        </button>
      </form>
    </main>
  );
};

export default AddPost;
