import { useState, useRef } from "react";
import { useThemeStore } from "../store/themeStore";
import DefaultAvatar from "../assets/default-avatar.jpg";

const ThemesPage = () => {
	const applyRef = useRef(null);
	const { themes, currTheme, setTheme } = useThemeStore();
	const [selectedTheme, setselectedTheme] = useState(currTheme);
	const handleApply = (e) => {
		setTheme(selectedTheme);
	};
	const handleClick = (e) => {
		localStorage.setItem("theme", e.currentTarget.id);
		setselectedTheme(e.currentTarget.id);
		applyRef.current?.scrollIntoView({ behavior: "smooth" });
	};
	return (
		<div className="bg-base-100 p-2 h-[calc(100vh-3rem)] overflow-auto">
			<div className="flex justify-center items-center my-4  ">
				<span className="p-2 bg-base-200 rounded-2xl">
					Choose a theme of your choice :-
				</span>
			</div>

			<div className="grid grid-cols-2 md:grid-cols-3  lg:grid-cols-5 mx-[1%] sm:mx-[10%] gap-5 p-2 sm:p-5 bg-base-200 rounded-2xl my-8">
				{themes.map((item, i) => {
					return (
						<div
							key={item}
							id={item}
							className={`border-base-content/20 hover:border-base-content/40 overflow-hidden rounded-lg border outline-2  ${
								selectedTheme === item
									? "outline-primary"
									: "outline-transparent"
							}`}
							onClick={handleClick}
						>
							<div
								className="bg-base-100 text-base-content w-full cursor-pointer font-sans"
								data-theme={item}
							>
								<div className="grid grid-cols-5 grid-rows-3">
									<div className="bg-base-200 col-start-1 row-span-2 row-start-1"></div>
									<div className="bg-base-300 col-start-1 row-start-3"></div>
									<div className="bg-base-100 col-span-4 col-start-2 row-span-3 row-start-1 flex flex-col gap-1 p-2">
										<div className="font-bold">{item}</div>
										<div className="flex flex-wrap gap-1">
											<div className="bg-primary flex aspect-square w-5 items-center justify-center rounded lg:w-6">
												<div className="text-primary-content text-sm font-bold">
													Hi
												</div>
											</div>
											<div className="bg-secondary flex aspect-square w-5 items-center justify-center rounded lg:w-6">
												<div className="text-secondary-content text-sm font-bold">
													Hi
												</div>
											</div>
											<div className="bg-accent flex aspect-square w-5 items-center justify-center rounded lg:w-6">
												<div className="text-accent-content text-sm font-bold">
													Hi
												</div>
											</div>
											<div className="bg-neutral flex aspect-square w-5 items-center justify-center rounded lg:w-6">
												<div className="text-neutral-content text-sm font-bold">
													Hi
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					);
				})}
			</div>
			<div className="mx-[1%] sm:mx-[10%] gap-5 p-2 sm:p-5 lg:p-10 bg-base-200 rounded-2xl my-8">
				<div className="flex justify-between items-center">
					<div>
						<span className="p-2 bg-base-300 rounded-2xl">
							Theme Preview:-
						</span>
					</div>
					<button
						onClick={handleApply}
						ref={applyRef}
						className="bg-primary text-primary-content p-2 rounded-3xl hover:opacity-75 hover:cursor-pointer"
					>
						Apply
					</button>
				</div>
				<div className="outline-2 outline-primary my-10 mx-[5%] rounded-2xl ">
					<div
						data-theme={selectedTheme}
						className=" bg-base-100 rounded-2xl p-2"
					>
						<div className="bg-base-300  p-2 rounded-2xl flex gap-5 items-center  ">
							<img
								src={DefaultAvatar}
								alt=""
								className="size-10 rounded-full"
							/>
							<span>Shruti</span>
						</div>
						<div>
							<div className="mt-20 bg-base-200 p-2 rounded-2xl flex gap-5 items-center mr-[35%]">
								Hello Sounit, how you are doing? Long time no
								see.
							</div>
							<div className="my-12 bg-accent text-accent-content p-2 rounded-2xl flex gap-5 items-center ml-[35%]">
								I am fine . I was just busy with my assignments
								of college. How are you and what skills you are
								learning currently?
							</div>
							<div className="my-12 bg-base-200 p-2 rounded-2xl flex gap-5 items-center mr-[35%]">
								Oh same , I am also extremely busy with those
								hectic assignments.I am learning AIML currently
								because that is a very trending top and looks to
								offer a promising career.
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ThemesPage;
