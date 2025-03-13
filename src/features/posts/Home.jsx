import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { deletePost, getAllPosts } from "./postSlice";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { posts, status } = useSelector((state) => state.posts);
  const { user } = useSelector((state) => state.auth);
  const [activeMenu, setActiveMenu] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    dispatch(getAllPosts());
  }, [dispatch]);

  const toggleMenu = (postId) => {
    setActiveMenu(activeMenu === postId ? null : postId);
  };

  const handleEdit = (postId) => {
    navigate(`/edit/${postId}`);
    setActiveMenu(null);
  };

  const handleDelete = (postId) => {
    setIsDeleting(true);
    setDeleteId(postId);

    dispatch(deletePost(postId))
      .unwrap()
      .then(() => {
        setIsDeleting(false);
        setDeleteId(null);
      })
      .catch((e) => {
        console.error("Failed to delete the post", e);
        setIsDeleting(false);
        setDeleteId(null);
      });
  };

  useEffect(() => {
    const handleClickOutside = () => {
      if (activeMenu) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [activeMenu]);

  if (status === "loading" && posts.length === 0) {
    return <LoadingSpinner />;
  }
  return (
    <div className="container py-5">
      <div className="row mb-5">
        <div className="col-12">
          <div className="display-4 text-center fw-bold mb-3">
            Explore Posts
          </div>
          <p className="text-muted text-center mb-4">
            Discover the latest thoughts and ideas from our community
          </p>
          <hr className="w-50 mx-auto" />
          {posts && posts.length > 0 ? (
            <div className="row g-4">
              {posts.map((post) => (
                <div className="col-lg-4 col-md-6" key={post._id}>
                  <div className="card h-100 shadow sm border-0 rounded-3 hover-shadow">
                    {post.image ? (
                      <div
                        className="card-img-top rounded-top"
                        style={{
                          height: "200px",
                          backgroundImage: `url(${post.image})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      ></div>
                    ) : (
                      <div
                        className="card-img-top bg-light d-flex justify-content-center align-items-center rounded-top"
                        style={{ height: "200px" }}
                      >
                        <i className="bi bi-file-text display-4 text-muted"></i>
                      </div>
                    )}
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="card-title fw-bold mb-0">
                          {post.title}
                        </h5>
                        {user &&
                          (user._id === post.author ||
                            user._id === post.author?._id) && (
                            <div
                              className="dropdown"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                className="btn btn-sm btn-light rounded-circle"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleMenu(post._id);
                                }}
                                style={{
                                  width: "32px",
                                  height: "32px",
                                }}
                              >
                                <i className="bi bi-three-dots-vertical"></i>
                              </button>
                              {activeMenu === post._id && (
                                <div
                                  className="dropdown-menu dropdown-menu-end shadow show"
                                  style={{ position: "absolute", zIndex: 1000 }}
                                >
                                  <button
                                    className="dropdown-item"
                                    onClick={() => handleEdit(post._id)}
                                  >
                                    <i className="bi bi-pencil me-2"></i>Edit
                                  </button>
                                  <button
                                    className="dropdown-item text-danger"
                                    onClick={() => handleDelete(post._id)}
                                    disabled={
                                      isDeleting && deleteId === post._id
                                    }
                                  >
                                    {isDeleting && deleteId === post._id ? (
                                      <>
                                        <span
                                          className="spinner-border spinner-border-sm me-2"
                                          role="status"
                                          aria-hidden="true"
                                        ></span>
                                        Deleting...
                                      </>
                                    ) : (
                                      <>
                                        <i className="bi bi-trash me-2"></i>
                                        Delete
                                      </>
                                    )}
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                      </div>
                      <p className="card-text text-muted">
                        {post.content.length > 120
                          ? `${post.content.substring(0, 120)}...`
                          : post.content}
                      </p>
                    </div>
                    <div className="card-footer bg-white border-0 d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        {new Date(post.createdAt).toLocaleDateString("en-us", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </small>
                      <small className="text-primary">
                        By: {`@${post?.author.username}` || "Unknown"}
                      </small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <div className="mb-4">
                <i className="bi bi-journal-text display-1 text-muted"></i>
              </div>
              <h3>No posts found</h3>
              <p className="text-muted">
                Be the first to share your thoughts with the community!
              </p>
              <Link to="/" className="btn btn-primary mt-3">
                Create Post
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
