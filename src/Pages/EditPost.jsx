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
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
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
        {imgUrl && !file && (
          <img
            src={imgUrl}
            alt="Current Post"
            className="w-full h-48 object-cover mt-2 rounded"
          />
        )}
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
        {uploading ? "Updating..." : "Update Post"}
      </button>
    </form>
  );
};

export default EditPost;
