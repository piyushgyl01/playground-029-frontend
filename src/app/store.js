import { configureStore } from "@reduxjs/toolkit";
import { authSlice } from "../features/auth/authSlice";
import { postSlice } from "../features/posts/postSlice";

export default configureStore({
  reducer: {
    auth: authSlice.reducer,
    posts: postSlice.reducer,
  },
});
