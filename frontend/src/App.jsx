import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router";
import { Toaster, toast } from "react-hot-toast";
import "./index.css";
import { useAuthStore } from "./store/authStore";
import { useThemeStore } from "./store/themeStore";
import { useGlobalStore } from "./store/globalStore";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProfilePage from "./pages/ProfilePage";
import ThemesPage from "./pages/ThemesPage";

const App = () => {
	const { currTheme } = useThemeStore();
	const { authUser, checkAuth } = useAuthStore();
	const { setFullScreenImage, fullScreenImage } = useGlobalStore();

	useEffect(() => {
		toast("Hello! \n If the website was inactive, kindly wait for a minute for the backend to start", {
			icon: "👏",
			style: {
				borderRadius: "10px",
				background: "#333",
				color: "#fff",
			},
		});
	}, []);

	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

	return (
		<div
			data-theme={currTheme}
			className="relative h- overflow-auto"
			style={{ fontFamily: "'Roboto', sans-serif" }}
		>
			<Toaster />
			{fullScreenImage && (
				<div className="fixed inset-0 z-20 bg-black/85">
					<div className="h-full w-full flex justify-center items-center relative overflow-auto">
						<img
							src={fullScreenImage}
							alt=""
							className="max-w-full max-h-full object-contain"
						/>
						<div
							className="absolute top-10 right-10 bg-gray-600 rounded-full size-12 hover:cursor-pointer"
							onClick={() => setFullScreenImage("")}
						>
							<lord-icon
								src="https://cdn.lordicon.com/nqtddedc.json"
								trigger="hover"
								className="size-12"
							></lord-icon>
						</div>
					</div>
				</div>
			)}

			<Navbar />

			<Routes>
				<Route
					path="/"
					element={
						authUser ? <HomePage /> : <Navigate to="/sign-up" />
					}
				/>
				<Route
					path="/login"
					element={authUser ? <Navigate to="/" /> : <LoginPage />}
				/>
				<Route
					path="/profile"
					element={
						authUser ? <ProfilePage /> : <Navigate to="/sign-up" />
					}
				/>
				<Route
					path="/sign-up"
					element={authUser ? <Navigate to="/" /> : <SignupPage />}
				/>
				<Route path="/themes" element={<ThemesPage />} />
			</Routes>
		</div>
	);
};

export default App;
