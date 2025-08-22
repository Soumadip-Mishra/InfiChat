import { useState } from "react";
import { Link } from "react-router";
import { useAuthStore } from "../store/authStore";
import Community from "../assets/community.jpg";
import AnimatedLogo from "../components/AnimatedLogo";
const SignupPage = () => {
	const { signUpUser } = useAuthStore();
	const [inputData, setInputdata] = useState({});
	const [passwordState, setPasswordState] = useState("password");
	const signUser = async (e) => {
		e.preventDefault();
		let { name, email, password } = inputData;
		if (name) name = name.trim();
		if (email) email = email.trim();
		if (password) password = password.trim();
		if (!email || !password || !email) {
			toast.error("All fields are necessary");
			return;
		}
		const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
		if (emailRegex.test(email) === false) {
			toast.error("Enter proper email");
			return;
		}
		signUpUser(inputData);
	};
	return (
		<div className="flex max-md:flex-col ">
			<div className="flex flex-col justify-around items-center flex-1 md:w-1/2 m-4 rounded-2xl bg-base-200 h-[calc(100vh-5rem)] gap-2">
				<AnimatedLogo sz={48} />
				<div className="size-48 hidden"></div>
				<div className="size-24 hidden"></div>
				{/* so that tailwind generates */}
				<div className="flex justify-center">
					<form className="flex flex-col gap-1 ">
						<div>
							<div>Input Your Email :-</div>
							<input
								onChange={(e) => {
									setInputdata({
										...inputData,
										email: e.target.value,
									});
								}}
								type="email"
								className="border p-2 rounded"
								placeholder="sounitb02@gmail.com"
							/>
						</div>
						<div>
							<div>Input Your Full-Name :-</div>
							<input
								onChange={(e) => {
									setInputdata({
										...inputData,
										name: e.target.value,
									});
								}}
								type="text"
								className="border p-2 rounded"
								placeholder="Sounit Bose"
							/>
						</div>
						<div>
							<div>Input Your Password :-</div>
							<div className="border rounded flex items-center focus-within:outline-1">
								<input
									onChange={(e) => {
										setInputdata({
											...inputData,
											password: e.target.value,
										});
									}}
									className="p-2 focus:outline-0  "
									type={passwordState}
									placeholder="Avskf249i"
								/>
								<lord-icon
									src="https://cdn.lordicon.com/dicvhxpz.json"
									trigger="click"
									style={{ width: "2rem", height: "2rem" }}
									className="  current-color hover:cursor-pointer"
									onClick={() =>
										passwordState === "password"
											? setPasswordState("text")
											: setPasswordState("password")
									}
								></lord-icon>
							</div>
						</div>
						<button
							className="bg-accent text-accent-content mx-15 py-2 rounded-2xl hover:bg-primary hover:text-primary-content hover:cursor-pointer"
							onClick={signUser}
						>
							{" "}
							Sign up{" "}
						</button>
					</form>
				</div>
				<div>
					<span>Already signed up ? </span>
					<Link to="/login">
						<span className="text-blue-700 underline hover:text-purple-600">
							Log in{" "}
						</span>
					</Link>
				</div>
			</div>

			<div className="flex flex-col py-8 justify-around items-center flex-1 md:w-1/2 m-4 rounded-2xl bg-base-200 h-[calc(100vh-5rem)] gap-16  ">
				<img
					src={Community}
					alt=""
					className="w-96 h-60 rounded-[50%]"
				/>
				<div className="rainbow-text bg-linear-to-r/decreasing from-violet-700 via-lime-300 to-violet-700">
					<div>Why to use InfiChat?</div>
					<ul className="">
						<li className=" rainbow-text bg-gradient-to-r from-blue-700 via-teal-300 to-indigo-700">
							=&gt; Have unlimited chatting with your friends.
						</li>
						<li className=" rainbow-text bg-gradient-to-r from-rose-700 via-orange-300 to-red-700">
							=&gt; Friend offline , why not make new friends?
						</li>
						<li className=" rainbow-text bg-gradient-to-r from-green-700 via-lime-300 to-emerald-700">
							=&gt; Don't want to make friends , why not chat with
							Infi-Ai
						</li>
					</ul>
				</div>

				<div className="animate-bounce ">
					<span className="animate-pulse rainbow-text bg-linear-to-r/decreasing from-violet-700 via-lime-300 to-violet-700">
						Join our amazing community today and become a member of
						InfiChat.
					</span>
				</div>
			</div>
		</div>
	);
};

export default SignupPage;
