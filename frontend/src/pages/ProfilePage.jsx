import FormData from "form-data";
import { useAuthStore } from "../store/authStore";
import Avatar from "../assets/default-avatar.jpg";
import Camera from "../assets/camera.webp";
import NameChangeBox from "../components/profile/NameChangeBox";
import PasswordChangeBox from "../components/profile/PasswordChangeBox";
const ProfilePage = () => {
	const {
		authUser,
		isUpdatingName,
		isUpdatingPassword,
		setisUpdatingName,
		setisUpdatingPassword,
		changeImage,
	} = useAuthStore();
	const handlePicChange = (e) => {
		e.preventDefault();
		let file = e.target.files[0];
		if (!file) return;
		const formData = new FormData();
		formData.append("image", file);
		changeImage(formData);
	};
	const handleNameChange = (e) => {
		setisUpdatingName(true);
	};
	const handlePasswordChange = (e) => {
		setisUpdatingPassword(true);
	};
	return (
		<div className="h-[calc(100vh-3rem)] bg-base-100 flex justify-center items-center p-4">
			<div className="bg-base-200 rounded-2xl flex h-[100%] p-8 w-[90%] md:w-[80%] lg:w-[60%] flex-col gap-4 justify-around       ">
				{isUpdatingName ? <NameChangeBox /> : ""}
				{isUpdatingPassword ? <PasswordChangeBox /> : ""}
				{!isUpdatingName && !isUpdatingPassword ? (
					<>
						<div className="flex justify-center rounded-full">
							<div className=" flex relative rounded-full ">
								<img
									src={
										!authUser.profilePic
											? Avatar
											: authUser.profilePic
									}
									alt=""
									className="size-60 rounded-full "
								/>
								<label htmlFor="changePic">
									<img
										src={Camera}
										alt=""
										className="size-14 hover:brightness-125 rounded-full absolute bottom-0 right-[5.6rem] hover:cursor-pointer"
									/>
								</label>
							</div>
							<input
								type="file"
								name="image"
								className="hidden"
								id="changePic"
								accept="image/*"
								onChange={handlePicChange}
							/>
						</div>

						<div className="flex flex-col gap-2 items-start">
							<div>Email:-</div>
							<span className="outline-1 p-2 rounded-2xl bg-base-300">
								{authUser.email}
							</span>
						</div>

						<div className="flex flex-col gap-2 ">
							<div>Name:-</div>
							<div className="flex justify-between ">
								<span className="outline-1 p-2 rounded-2xl bg-base-300">
									{authUser.name}
								</span>
								<button
									className="ml-10 bg-primary text-primary-content p-2 rounded-2xl hover:cursor-pointer hover:bg-secondary hover:text-secondary-content"
									onClick={handleNameChange}
								>
									Change 
								</button>
							</div>
						</div>

						<div className="flex flex-col gap-2 ">
							<div>Password:-</div>
							<div className="flex justify-between ">
								<div className="flex items-center outline-1 p-2 rounded-2xl bg-base-300">
									{"●".repeat(8)}
								</div>
								<button
									className=" ml-10 bg-primary text-primary-content p-2 rounded-2xl hover:cursor-pointer hover:bg-secondary hover:text-secondary-content"
									onClick={handlePasswordChange}
								>
									Change 
								</button>
							</div>
						</div>
					</>
				) : (
					""
				)}
			</div>
		</div>
	);
};

export default ProfilePage;
