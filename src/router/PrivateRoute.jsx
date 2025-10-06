import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Loading from "../utilities/laoding/Loading";

const PrivateRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <Loading />;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
};

export default PrivateRoute;
