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

export default function Posts() {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [commentTexts, setCommentTexts] = useState({});
  const [comments, setComments] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 5;
  const defaultProfilePhoto =
    "/if-traveling-icon-flat-outline08-3405109_107381.webp";

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

  const handleDelete = async (postId) => {
    try {
      await deleteDoc(doc(db, "posts", postId));
    } catch (error) {
      console.error("Error deleting post: ", error);
    }
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
            className="w-full h-64 md:h-80 lg:h-96 rounded-lg object-cover object-center mb-4"
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
                <Link
                  to={`/editpost/${post.id}`}
                  className="flex items-center justify-center bg-gray-500 text-white p-2 rounded-full hover:bg-blue-600 transition duration-300"
                >
                  <FontAwesomeIcon icon={faPenToSquare} size="lg" />
                </Link>

                <button
                  onClick={() => handleDelete(post.id)}
                  className="flex items-center justify-center bg-gray-500 text-white p-2 rounded-full hover:bg-red-600 transition duration-300"
                >
                  <FontAwesomeIcon icon={faTrash} size="lg" />
                </button>
              </div>
            )}
          </div>
          <p className="text-gray-700 mb-4 break-words">{post.description}</p>
          <div className="flex items-center space-x-4">
            {currentUser && (
              <button onClick={() => handleLike(post.id)}>
                {post.likes && post.likes.includes(currentUser.uid) ? (
                  <FontAwesomeIcon
                    icon={faHeart}
                    size="lg"
                    className="text-red-500 text-2xl"
                  />
                ) : (
                  <FontAwesomeIcon
                    icon={faHeart}
                    size="lg"
                    className="text-gray-700 text-2xl"
                  />
                )}
              </button>
            )}
            <span>{post.likes ? post.likes.length : 0} Likes</span>
          </div>
          {currentUser && (
            <div className="mt-4">
              <textarea
                value={commentTexts[post.id] || ""}
                onChange={(e) => handleCommentChange(post.id, e)}
                className="w-full p-2 border border-gray-300 rounded mb-2"
                placeholder="Add a comment"
              ></textarea>
              <button
                onClick={() => handleAddComment(post.id)}
                className="bg-gray-400 text-white p-2 rounded hover:bg-blue-600"
              >
                Add a Comment <FontAwesomeIcon icon={faComment} />
              </button>
            </div>
          )}
          <div className="mt-4">
            <h3 className="text-lg font-bold mb-2">Comments</h3>
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
                  <div>
                    <p className="text-sm font-semibold mt-4">
                      {comment.displayName} -{" "}
                      {comment.createdAt.toDate().toLocaleDateString()}
                    </p>
                    <p className="text-gray-700 break-words">{comment.text}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No comments yet</p>
            )}
          </div>
        </article>
      ))}
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
