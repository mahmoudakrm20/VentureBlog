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
  const defaultProfilePhoto =
    "/if-traveling-icon-flat-outline08-3405109_107381.webp";

  // States for full-screen modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  // States for confirmation modal
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
      setComments((prevComments) => ({
        ...prevComments,
        [postId]: commentsArray,
      }));
    });

    return unsubscribe;
  };

  const handleDeletePost = async (postId) => {
    // Open confirmation modal for post deletion
    setItemToDelete({ type: "post", id: postId });
    setIsConfirmationOpen(true);
  };

  const handleDeleteComment = async (postId, commentId) => {
    // Open confirmation modal for comment deletion
    setItemToDelete({ type: "comment", id: commentId, postId: postId });
    setIsConfirmationOpen(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete.type === "post") {
      try {
        await deleteDoc(doc(db, "posts", itemToDelete.id));
      } catch (error) {
        console.error("Error deleting post: ", error);
      }
    } else if (itemToDelete.type === "comment") {
      try {
        await deleteDoc(
          doc(db, "posts", itemToDelete.postId, "comments", itemToDelete.id)
        );
      } catch (error) {
        console.error("Error deleting comment: ", error);
      }
    }

    // Close confirmation modal
    setIsConfirmationOpen(false);
    setItemToDelete({ type: "", id: "", postId: "" });
  };

  const handleLike = async (postId) => {
    try {
      const postPath = doc(db, "posts", postId);
      const postSnapshot = await getDoc(postPath);
      const post = postSnapshot.data();

      if (post.likes && post.likes.includes(currentUser.uid)) {
        await updateDoc(postPath, {
          likes: arrayRemove(currentUser.uid),
        });
      } else {
        await updateDoc(postPath, {
          likes: arrayUnion(currentUser.uid),
        });
      }
    } catch (error) {
      console.error("Error liking post: ", error);
    }
  };

  const handleAddComment = async (postId) => {
    try {
      const commentText = commentTexts[postId] || "";
      if (commentText.trim() === "") return;
      const comment = {
        userId: currentUser.uid,
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL || defaultProfilePhoto,
        text: commentText,
        createdAt: Timestamp.fromDate(new Date()),
      };
      await addDoc(collection(db, "posts", postId, "comments"), comment);
      setCommentTexts((prev) => ({ ...prev, [postId]: "" }));
    } catch (error) {
      console.error("Error adding comment: ", error);
    }
  };

  const handleCommentChange = (postId, event) => {
    setCommentTexts((prev) => ({ ...prev, [postId]: event.target.value }));
  };

  const paginatePosts = () => {
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    return posts.slice(indexOfFirstPost, indexOfLastPost);
  };

  const nextPage = () => {
    if (currentPage < Math.ceil(posts.length / postsPerPage)) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Function to handle image click to open modal
  const openModal = (image) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage("");
  };

  return (
    <div className="container mx-auto px-4">
      {paginatePosts().map((post) => (
        <article
          key={post.id}
          className="bg-white p-6 rounded-lg shadow-md mb-6 overflow-hidden"
        >
          <img
            src={post.imgUrl}
            alt="Post Image"
            className="w-full h-64 md:h-80 lg:h-96 rounded-lg object-cover object-center mb-4 cursor-pointer"
            onClick={() => openModal(post.imgUrl)} // Handle image click
          />
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <img
                src={post.photoURL || defaultProfilePhoto}
                alt="Profile"
                className="w-10 h-10 rounded-full mr-2"
              />
              <div>
                <h2 className="text-2xl font-bold">{post.displayName}</h2>
                <p className="text-gray-500">
                  {post.createdAt.toDate().toLocaleDateString()}
                </p>
              </div>
            </div>
            {currentUser && post.userId === currentUser.uid && (
              <div className="flex items-center space-x-4">
                <Link to={`/edit/${post.id}`}>
                  <FontAwesomeIcon
                    icon={faPenToSquare}
                    className="text-blue-600 cursor-pointer"
                  />
                </Link>
                <FontAwesomeIcon
                  icon={faTrash}
                  className="text-red-600 cursor-pointer"
                  onClick={() => handleDeletePost(post.id)} // Call delete function
                />
              </div>
            )}
          </div>
          <div className="text-gray-700 break-words">{post.text}</div>
          <div className="flex items-center mt-4">
            <button onClick={() => handleLike(post.id)} className="mr-2">
              <FontAwesomeIcon
                icon={faHeart}
                className={`text-xl ${
                  post.likes?.includes(currentUser.uid)
                    ? "text-red-500"
                    : "text-gray-400"
                }`}
              />
            </button>
            <span>{post.likes?.length || 0} Likes</span>
          </div>

          {/* Comment Section */}
          <div className="mt-4">
            <textarea
              value={commentTexts[post.id] || ""}
              onChange={(event) => handleCommentChange(post.id, event)}
              className="border rounded w-full p-2 mb-2"
              placeholder="Add a comment"
            ></textarea>
            <button
              onClick={() => handleAddComment(post.id)}
              className="bg-gray-400 text-white p-2 rounded hover:bg-blue-600"
            >
              Add a Comment <FontAwesomeIcon icon={faComment} />
            </button>
          </div>
          <div className="mt-4">
            {comments[post.id] && comments[post.id].length > 0 ? (
              comments[post.id].map((comment) => (
                <div
                  key={comment.id}
                  className="mb-2 flex items-start mt-4 border-t-2"
                >
                  <img
                    src={comment.photoURL || defaultProfilePhoto}
                    alt="Profile"
                    className="w-8 h-8 rounded-full mr-2 mt-4"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold mt-4">
                      {comment.displayName} -{" "}
                      {comment.createdAt.toDate().toLocaleDateString()}
                    </p>
                    <p className="text-gray-700 break-words">{comment.text}</p>
                  </div>
                  {currentUser &&
                    (currentUser.uid === comment.userId ||
                      currentUser.uid === post.userId) && (
                      <button
                        onClick={() => handleDeleteComment(post.id, comment.id)} // Calls handleDeleteComment
                        className="text-black hover:text-red-500  mr-3 mt-3"
                      >
                        X {/* Replaced trash icon with "X" */}
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

      {/* Full-Screen Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50"
          onClick={closeModal} // Close the modal on background click
        >
          <img
            src={selectedImage}
            alt="Full Screen"
            className="max-h-full max-w-full object-contain"
            onClick={(e) => e.stopPropagation()} // Prevent click on image from closing the modal
          />
          <button
            onClick={closeModal}
            className="absolute top-5 right-10 text-white text-2xl"
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

      <div className="flex justify-between mt-4">
        <button
          onClick={prevPage}
          className={`bg-gray-500 text-white p-2 rounded mb-2 hover:bg-blue-600 ${
            currentPage === 1 ? "opacity-50" : ""
          }`}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <button
          onClick={nextPage}
          className={`bg-gray-500 text-white p-2 rounded mb-2 hover:bg-blue-600 ${
            currentPage === Math.ceil(posts.length / postsPerPage)
              ? "opacity-50"
              : ""
          }`}
          disabled={currentPage === Math.ceil(posts.length / postsPerPage)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
