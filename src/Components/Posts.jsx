import { useState, useEffect } from "react";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  addDoc,
  Timestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../contexts/authContext";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPenToSquare,
  faTrash,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";
import { faComment } from "@fortawesome/free-regular-svg-icons";
import ConfirmationModal from "./ConfirmationModal";

export default function Posts() {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [commentTexts, setCommentTexts] = useState({});
  const [comments, setComments] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 5;
  const defaultProfilePhoto = "/if-traveling-icon-flat-outline08-3405109_107381.webp";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState({
    type: "",
    id: "",
    postId: "",
  });

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const postsArray = [];
      querySnapshot.forEach((doc) => {
        postsArray.push({ ...doc.data(), id: doc.id });
      });
      setPosts(postsArray);

      for (const post of postsArray) {
        await fetchComments(post.id);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchComments = async (postId) => {
    const commentsQuery = query(
      collection(db, "posts", postId, "comments"),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
      const commentsArray = [];
      snapshot.forEach((doc) => {
        commentsArray.push({ ...doc.data(), id: doc.id });
      });
      setComments((prev) => ({ ...prev, [postId]: commentsArray }));
    });

    return unsubscribe;
  };

  const handleDeletePost = async (postId) => {
    setItemToDelete({ type: "post", id: postId });
    setIsConfirmationOpen(true);
  };

  const handleDeleteComment = async (postId, commentId) => {
    setItemToDelete({ type: "comment", id: commentId, postId: postId });
    setIsConfirmationOpen(true);
  };

  const confirmDelete = async () => {
    try {
      if (itemToDelete.type === "post") {
        await deleteDoc(doc(db, "posts", itemToDelete.id));
      } else if (itemToDelete.type === "comment") {
        await deleteDoc(doc(db, "posts", itemToDelete.postId, "comments", itemToDelete.id));
      }
    } catch (error) {
      console.error("Error deleting:", error);
    } finally {
      setIsConfirmationOpen(false);
      setItemToDelete({ type: "", id: "", postId: "" });
    }
  };

  const handleLike = async (postId) => {
    if (!currentUser) return;
    try {
      const postRef = doc(db, "posts", postId);
      const snapshot = await getDoc(postRef);
      const post = snapshot.data();

      const hasLiked = post.likes?.includes(currentUser.uid);
      await updateDoc(postRef, {
        likes: hasLiked
          ? arrayRemove(currentUser.uid)
          : arrayUnion(currentUser.uid),
      });
    } catch (error) {
      console.error("Error liking post: ", error);
    }
  };

  const handleAddComment = async (postId) => {
    if (!currentUser) return;
    const text = commentTexts[postId] || "";
    if (text.trim() === "") return;

    try {
      await addDoc(collection(db, "posts", postId, "comments"), {
        userId: currentUser.uid,
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL || defaultProfilePhoto,
        text,
        createdAt: Timestamp.now(),
      });
      setCommentTexts((prev) => ({ ...prev, [postId]: "" }));
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleCommentChange = (postId, e) => {
    setCommentTexts((prev) => ({ ...prev, [postId]: e.target.value }));
  };

  const paginatePosts = () => {
    const start = (currentPage - 1) * postsPerPage;
    return posts.slice(start, start + postsPerPage);
  };

  const nextPage = () => {
    if (currentPage < Math.ceil(posts.length / postsPerPage)) {
      setCurrentPage((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const openModal = (image) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedImage("");
    setIsModalOpen(false);
  };

  return (
    <div className="container mx-auto px-4">
      {paginatePosts().map((post) => (
        <article key={post.id} className="bg-white p-6 rounded-lg  shadow-md mb-6">
          {post.imgUrl && (
            <img
              src={post.imgUrl}
              alt="Post Image"
              className="w-full h-64 md:h-80 lg:h-96 object-cover rounded cursor-pointer mb-4"
              onClick={() => openModal(post.imgUrl)}
            />
          )}
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <img
                src={post.photoURL || defaultProfilePhoto}
                alt="Profile"
                className="w-10 h-10 rounded-full mr-2"
              />
              <div>
                <h2 className="text-xl font-bold">{post.displayName}</h2>
                <p className="text-gray-500">
                  {post.createdAt.toDate().toLocaleDateString()}
                </p>
              </div>
            </div>
            {currentUser && currentUser.uid === post.userId && (
              <div className="flex items-center space-x-4">
                <Link to={`/editpost/${post.id}`}>
                  <FontAwesomeIcon icon={faPenToSquare} className="text-blue-600" />
                </Link>
                <FontAwesomeIcon
                  icon={faTrash}
                  className="text-red-600 cursor-pointer"
                  onClick={() => handleDeletePost(post.id)}
                />
              </div>
            )}
          </div>

          <p className="text-gray-800 mb-2 break-words mt-4">{post.description}</p>
          <div className="flex items-center mt-4 mb-4">
            <button onClick={() => handleLike(post.id)} disabled={!currentUser}>
              <FontAwesomeIcon
                icon={faHeart}
                className={`text-xl mr-2 ${
                  currentUser && post.likes?.includes(currentUser.uid)
                    ? "text-red-500"
                    : "text-gray-400"
                }`}
              />
            </button>
            <span>{post.likes?.length || 0} Likes</span>
          </div>

          {/* Comments */}
          <div>
            <textarea
              value={commentTexts[post.id] || ""}
              onChange={(e) => handleCommentChange(post.id, e)}
              placeholder="Add a comment"
              className="w-full p-2 border rounded mb-2"
              disabled={!currentUser}
            />
            <button
              onClick={() => handleAddComment(post.id)}
              disabled={!currentUser}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Add Comment <FontAwesomeIcon icon={faComment} />
            </button>
          </div>

          <div className="mt-4">
            {comments[post.id]?.length > 0 ? (
              comments[post.id].map((comment) => (
                <div key={comment.id} className="flex items-start mb-2 border-t pt-2">
                  <img
                    src={comment.photoURL || defaultProfilePhoto}
                    alt="Commenter"
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">
                      {comment.displayName} -{" "}
                      {comment.createdAt.toDate().toLocaleDateString()}
                    </p>
                    <p>{comment.text}</p>
                  </div>
                  {currentUser &&
                    (currentUser.uid === comment.userId ||
                      currentUser.uid === post.userId) && (
                      <button
                        onClick={() => handleDeleteComment(post.id, comment.id)}
                        className="text-red-500 ml-2"
                      >
                        X
                      </button>
                    )}
                </div>
              ))
            ) : (
              <p className="text-gray-500">No comments yet</p>
            )}
          </div>
        </article>
      ))}

      {/* Pagination */}
      <div className="flex justify-between mt-4">
        <button
          onClick={prevPage}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-500 text-white rounded disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={nextPage}
          disabled={currentPage === Math.ceil(posts.length / postsPerPage)}
          className="px-4 py-2 bg-gray-500 text-white rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Image Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
          onClick={closeModal}
        >
          <img
            src={selectedImage}
            alt="Modal"
            className="max-w-full max-h-full"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={closeModal}
            className="absolute top-4 right-6 text-white text-2xl"
          >
            X
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        onConfirm={confirmDelete}
        itemType={itemToDelete.type}
      />
    </div>
  );
}
