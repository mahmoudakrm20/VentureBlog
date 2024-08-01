import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, storage } from "../firebase/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [imgUrl, setImgUrl] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      const idPath = doc(db, "posts", id);
      const idSnap = await getDoc(idPath);
      if (idSnap.exists()) {
        const post = idSnap.data();
        setImgUrl(post.imgUrl);
        setDescription(post.description);
      } else {
        console.error("No document!");
      }
    };

    fetchPost();
  }, [id]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    let newImgUrl = imgUrl;

    if (file) {
      const fileName = `${Date.now()}_${file.name}`;
      const fileRef = ref(storage, `posts/${fileName}`);

      try {
        await uploadBytes(fileRef, file);
        newImgUrl = await getDownloadURL(fileRef);
      } catch (error) {
        console.error("Error uploading file: ", error);
        setUploading(false);
        return;
      }
    }

    const idPath = doc(db, "posts", id);
    await updateDoc(idPath, {
      imgUrl: newImgUrl,
      description,
    });

    setUploading(false);
    navigate("/");
  };

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
          {imgUrl && !file && (
            <img
              src={imgUrl}
              alt="Current Post"
              className="w-full h-48 object-cover mt-2 rounded-lg"
            />
          )}
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
          {uploading ? "Updating..." : "Update Post"}
        </button>
      </form>
    </main>
  );
};

export default EditPost;
