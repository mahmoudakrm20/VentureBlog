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
      <div className="bg-white mt-1 p-6 rounded-lg shadow-md text-center">
        <p className="text-gray-700 font-bold mb-4">
          You need to be logged in to post.
        </p>
        <Link
          to="/login"
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 mt-1 rounded-lg shadow-md"
    >
      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">
          Image Upload
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">
          Post Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <button
        type="submit"
        className={`bg-blue-500 text-white p-2 rounded hover:bg-blue-600 ${
          uploading ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Add Post"}
      </button>
    </form>
  );
};

export default AddPost;
