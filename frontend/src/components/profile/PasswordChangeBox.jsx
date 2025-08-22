import  { useState } from "react";
import { useAuthStore } from "../../store/authStore";

const PasswordChangeBox = () => {
	const { setisUpdatingPassword, changePassword } = useAuthStore();
	const differentPasswordStates = [
		"oldPassword",
		"newPassword",
		"confirmPassword",
	];
	const [inputData, setInputData] = useState({
		oldPassword: "",
		newPassword: "",
		confirmPassword: "",
	});
	const [passwordState, setPasswordState] = useState({
		oldPassword: "password",
		newPassword: "password",
		confirmPassword: "password",
	});
	const handleApply = async () => {
		await changePassword(inputData);
		setisUpdatingPassword(false);
	};
	return (
		<div className="h-full w-full flex justify-center items-center relative bg-base-300 rounded-2xl ">
			<div
				className="absolute top-10 right-10 bg-gray-600 rounded-full size-8 hover:cursor-pointer"
				onClick={() => {
					setisUpdatingPassword(false);
				}}
			>
				<lord-icon
					src="https://cdn.lordicon.com/nqtddedc.json"
					trigger="hover"
					className="size-8"
				></lord-icon>
			</div>
			<div className="flex flex-col gap-10 ">
				<div className="flex flex-col gap-5">
					{differentPasswordStates.map((value, index) => {
						return (
							<div key={index}>
								{index == 0 ? (
									<div>Enter Your Old Password :-</div>
								) : (
									""
								)}
								{index == 1 ? (
									<div>Enter Your New Password :-</div>
								) : (
									""
								)}
								{index == 2 ? (
									<div>Confirm Your New Password :-</div>
								) : (
									""
								)}
								<div className="border rounded flex items-center focus-within:outline-1">
									<input
										onChange={(e) => {
											setInputData({
												...inputData,
												[differentPasswordStates[
													index
												]]: e.target.value,
											});
										}}
										className="p-2 focus:outline-0  "
										type={
											passwordState[
												differentPasswordStates[index]
											]
										}
										placeholder="Avskf249i"
									/>
									<lord-icon
										src="https://cdn.lordicon.com/dicvhxpz.json"
										trigger="click"
										style={{
											width: "2rem",
											height: "2rem",
										}}
										className="  current-color hover:cursor-pointer"
										onClick={() =>
											setPasswordState({
												...passwordState,
												[differentPasswordStates[
													index
												]]:
													passwordState[
														differentPasswordStates[
															index
														]
													] === "password"
														? "text"
														: "password",
											})
										}
									></lord-icon>
								</div>
							</div>
						);
					})}
				</div>

				<button
					onClick={handleApply}
					className="bg-primary text-primary-content p-2 rounded-3xl hover:opacity-75 hover:cursor-pointer"
				>
					Apply
				</button>
			</div>
		</div>
	);
};

export default PasswordChangeBox;
