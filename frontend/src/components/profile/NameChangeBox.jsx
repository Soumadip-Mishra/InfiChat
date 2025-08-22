import { useState } from "react";
import { useAuthStore } from "../../store/authStore";

const NameChangeBox = () => {
	const { setisUpdatingName, changeName } = useAuthStore();
	const [name, setName] = useState("");
	const handleApply = async () => {
		await changeName({ newName: name });
		setisUpdatingName(false);
	};
	return (
		<div className="h-full w-full flex justify-center items-center relative bg-base-300 rounded-2xl ">
			<div
				className="absolute top-10 right-10 bg-gray-600 rounded-full size-8 hover:cursor-pointer"
				onClick={() => {
					setisUpdatingName(false);
				}}
			>
				<lord-icon
					src="https://cdn.lordicon.com/nqtddedc.json"
					trigger="hover"
					className="size-8"
				></lord-icon>
			</div>
			<div className="flex flex-col gap-10 ">
				<div>
					<div>Enter your New Name :-</div>
					<div>
						<input
							onChange={(e) => {
								setName(e.target.value);
							}}
							type="text"
							className="border p-2 rounded"
							placeholder="Sounit Bose"
						/>
					</div>
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

export default NameChangeBox;
