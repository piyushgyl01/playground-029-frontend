import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { oauthLoginSuccess } from "../features/auth/authSlice";
import LoadingSpinner from "../components/LoadingSpinner";

export default function OAuthCallback() {
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const token = params.get("token");
        const userJson = params.get("user");

        if (!token) {
          setError("Authentication failed. Token not received.");
          return;
        }

        // Parse user data
        let user;
        try {
          user = userJson ? JSON.parse(decodeURIComponent(userJson)) : null;
        } catch (e) {
          console.error("Error parsing user data:", e);
          setError("Error processing user data.");
          return;
        }

        // Store token and user in localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        // Update Redux state
        dispatch(oauthLoginSuccess({ token, user }));

        // Redirect to home page
        navigate("/");
      } catch (err) {
        console.error("OAuth callback error:", err);
        setError("Authentication failed. Please try again.");
      }
    };

    handleOAuthCallback();
  }, [dispatch, location, navigate]);

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center" role="alert">
          {error}
        </div>
        <div className="text-center mt-3">
          <button
            className="btn btn-primary"
            onClick={() => navigate("/auth")}
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5 text-center">
      <h2>Completing Authentication</h2>
      <p>Please wait while we complete the authentication process...</p>
      <LoadingSpinner />
    </div>
  );
}