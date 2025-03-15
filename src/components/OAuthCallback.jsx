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
        const provider = params.get("provider"); // Get provider from URL params

        if (!token) {
          setError("Authentication failed. Token not received.");
          return;
        }

        if (!provider) {
          console.warn("Provider information missing, defaulting to 'unknown'");
        }

        // Parse user data
        let user;
        try {
          user = userJson ? JSON.parse(decodeURIComponent(userJson)) : null;
          
          // Ensure provider is part of the user object
          if (user && provider && !user.provider) {
            user.provider = provider;
          }
        } catch (e) {
          console.error("Error parsing user data:", e);
          setError("Error processing user data.");
          return;
        }

        // Store token, user, and provider in localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("auth_provider", provider || "unknown");

        // Update Redux state
        dispatch(oauthLoginSuccess({ token, user, provider }));

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