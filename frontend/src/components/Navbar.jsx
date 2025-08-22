import React, { useState, useRef, useEffect } from "react";
import Logo from "./Logo";
import { Link } from "react-router";
import { useAuthStore } from "../store/authStore";
import { LogOut, Palette, Settings, UserPen } from "lucide-react";

const Navbar = () => {
	const { authUser, logOutUser } = useAuthStore();
	const [showSettings, setShowSettings] = useState(false);
	const boxRef = useRef();

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (boxRef.current && !boxRef.current.contains(event.target)) {
				setShowSettings(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	return (
		<div className="bg-base-200 h-12  ">
			<div className="flex justify-between h-full relative">
				<Link to="/">
					<Logo sz={12} />
					<div className="size-12 hidden"></div>
				</Link>
				<div className="relative h-full">
					<div
						className={`text-xl rounded-2xl mr-10 select-none ${
							!showSettings
								? "bg-base-300"
								: "bg-secondary text-secondary-content"
						} 
                        hover:cursor-pointer hover:bg-secondary hover:text-secondary-content m-1 px-2 py-1 flex justify-center items-center gap-2`}
						onClick={() => setShowSettings(!showSettings)}
					>
						Settings
						<Settings />
					</div>

					{showSettings && (
						<div
							className="absolute select-none top-[100%] right-5  mt-1 w-40  bg-base-100 shadow-[0_0_10px_1px_var(--color-secondary)] rounded-xl p-3 z-50 flex flex-col gap-2 "
							ref={boxRef}
						>
							{authUser && (
								<Link
									to="/profile"
									className="hover:bg-base-200 rounded-md px-3 py-1 flex gap-4 justify-center"
									onClick={() => setShowSettings(false)}
								>
									Profile
									<UserPen />
								</Link>
							)}
							<Link
								to="/themes"
								className="hover:bg-base-200 rounded-md px-3 py-1 flex gap-4 justify-center "
								onClick={() => setShowSettings(false)}
							>
								Themes
								<Palette />
							</Link>
							{authUser && (
								<button
									onClick={() => {
										logOutUser();
										setShowSettings(false);
									}}
									className="hover:bg-red-500 rounded-md px-3 py-1 text-left flex gap-4 justify-center"
								>
									Log out
									<LogOut />
								</button>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default Navbar;
