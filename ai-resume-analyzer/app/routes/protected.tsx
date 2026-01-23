import { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router";

export default function ProtectedLayout() {
    const navigate = useNavigate();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            // If no token, kick them to Auth immediately
            navigate("/auth");
        } else {
            // If token exists, let them pass
            setIsAuthorized(true);
        }
    }, [navigate]);

    // Don't render anything (not even the page content) until checked
    if (!isAuthorized) return null;

    return <Outlet />;
}