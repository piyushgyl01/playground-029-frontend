import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "./authSlice";
import { FaGoogle, FaGithub, FaUser } from "react-icons/fa";

const BACKEND_URL = "https://playground-029-backend.vercel.app";

export default function Auth() {
  const [userData, setUserData] = useState({
    name: "",
    username: "",
    password: "",
  });
  const [isLogin, setIsLogin] = useState(true);
  const [success, setSuccess] = useState("");

  const dispatch = useDispatch();

  const { status, error, isAuthenticated, user, provider } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (status === "succeeded" && isAuthenticated) {
      navigate("/");
    }
  }, [status, isAuthenticated, navigate]);

  useEffect(() => {
    if (status === "succeeded" && !isLogin && !isAuthenticated) {
      setSuccess(
        "Registration successful! Please login with your credentials."
      );
      setIsLogin(true);
      setUserData({
        name: "",
        username: userData.username,
        password: "",
      });
    }
  }, [status, isLogin, isAuthenticated, userData.username]);

  const handleChange = (e) => {
    setUserData((prevData) => ({
      ...prevData,
      [e.target.id]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess("");

    if (isLogin) {
      dispatch(loginUser(userData));
    } else {
      dispatch(registerUser(userData));
    }
  };

  const handleOAuthLogin = (provider) => {
    // Store the intended provider in localStorage before redirection
    localStorage.setItem("intended_provider", provider);
    window.location.href = `${BACKEND_URL}/auth/${provider}`;
  };

  const isLoggedIn =
    isAuthenticated ||
    (localStorage.getItem("token") && localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("auth_provider");
    localStorage.removeItem("intended_provider");
    window.location.href = "/auth";
  };
  
  // Get provider icon
  const getProviderIcon = () => {
    const currentProvider = provider || user?.provider || localStorage.getItem("auth_provider");
    
    switch(currentProvider) {
      case 'google':
        return <FaGoogle className="me-2" />;
      case 'github':
        return <FaGithub className="me-2" />;
      default:
        return <FaUser className="me-2" />;
    }
  };
  
  // Get provider name for display
  const getProviderName = () => {
    const currentProvider = provider || user?.provider || localStorage.getItem("auth_provider");
    
    switch(currentProvider) {
      case 'google':
        return 'Google';
      case 'github':
        return 'GitHub';
      case 'local':
        return 'Username/Password';
      default:
        return 'Unknown provider';
    }
  };
  
  return (
    <main className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          {isLoggedIn ? (
            <div className="text-center">
              <p className="mb-2">
                Logged in as:{" "}
                <span className="fw-bold">{user?.username || JSON.parse(localStorage.getItem("user"))?.username}</span>
              </p>
              <p className="mb-4 d-flex align-items-center justify-content-center">
                {getProviderIcon()} Via {getProviderName()}
              </p>
              <button
                onClick={handleLogout}
                className="btn btn-danger w-100 mb-3"
              >
                Logout
              </button>
              <button
                onClick={() => navigate("/")}
                className="btn btn-secondary w-100"
              >
                Go to Home
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mb-4">
                <div
                  className="btn-group"
                  role="group"
                  aria-label="Login/Register"
                >
                  <input
                    type="radio"
                    className="btn-check"
                    name="authType"
                    id="login"
                    autoComplete="off"
                    checked={isLogin}
                    onChange={() => setIsLogin(true)}
                  />
                  <label htmlFor="login" className="btn btn-outline-primary">
                    Login
                  </label>
                  <input
                    type="radio"
                    className="btn-check"
                    name="authType"
                    id="register"
                    autoComplete="off"
                    checked={!isLogin}
                    onChange={() => setIsLogin(false)}
                  />
                  <label htmlFor="register" className="btn btn-outline-primary">
                    Register
                  </label>
                </div>
              </div>

              <h2 className="text-center mb-4">
                {isLogin ? "Login" : "Register"}
              </h2>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {success && (
                <div className="alert alert-success" role="alert">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {!isLogin && (
                  <div className="mb-4">
                    <label htmlFor="name" className="form-label">
                      Name:
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="form-control"
                      value={userData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                )}
                <div className="mb-4">
                  <label htmlFor="username" className="form-label">
                    Username:
                  </label>
                  <input
                    type="text"
                    id="username"
                    className="form-control"
                    value={userData.username}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="password" className="form-label">
                    Password:
                  </label>
                  <input
                    type="password"
                    id="password"
                    className="form-control"
                    value={userData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={status === "loading"}
                  >
                    {status === "loading"
                      ? "Loading"
                      : isLogin
                      ? "Login"
                      : "Register"}
                  </button>
                </div>
              </form>

              <div className="mt-4 text-center">
                <p className="text-muted mb-3">OR CONTINUE WITH</p>
                <div className="d-flex justify-content-center gap-3">
                  <button
                    className="btn btn-outline-danger d-flex align-items-center justify-content-center"
                    onClick={() => handleOAuthLogin("google")}
                    style={{ width: "120px" }}
                  >
                    <FaGoogle className="me-2" /> Google
                  </button>
                  <button
                    className="btn btn-outline-dark d-flex align-items-center justify-content-center"
                    onClick={() => handleOAuthLogin("github")}
                    style={{ width: "120px" }}
                  >
                    <FaGithub className="me-2" /> GitHub
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}