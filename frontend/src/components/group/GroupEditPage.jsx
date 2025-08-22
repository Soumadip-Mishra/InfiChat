import { useEffect, useState, useRef } from "react";
import {
	Crown,
	LogOut,
	MessageCircle,
	UserPlus,
	UserRoundMinus,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useGroupStore } from "../../store/groupStore";
import { useGlobalStore } from "../../store/globalStore";
import AddMember from "./AddMember";
import Camera from "../../assets/camera.webp";
import DefaultAvatar from "../../assets/default-avatar.jpg";
import DefaultGroupAvatar from "../../assets/default-group-avatar.png";

const GroupEditPage = () => {
	const {
		info,
		setInfoView,
		getInfo,
		changeGroupName,
		changeGroupDescription,
		changeGroupPic,
		removeMember,
		makeAdmin,
		exitGroup,
	} = useGroupStore();
	const {
		selectedGroup,
		setSelectedUser,
		setFullScreenImage,
		setSidebarType,
	} = useGlobalStore();
	const { authUser } = useAuthStore();

	const [name, setName] = useState("");
	const [showOptions, setShowOptions] = useState(null);
	const [nameFocus, setNameFocus] = useState(false);
	const [description, setDescription] = useState("");
	const [descriptionFocus, setDescriptionFocus] = useState(false);
	const [addMembersView, setAddMembersView] = useState(false);

	const handlePicChange = (e) => {
		e.preventDefault();
		let file = e.target.files[0];
		if (!file) return;
		const formData = new FormData();
		formData.append("image", file);
		changeGroupPic(formData);
	};
	const buttonRefs = useRef([]);
	const addMemberRef = useRef();
	const addMemberInsideRef = useRef();

	useEffect(() => {
		setAddMembersView(false);
		setShowOptions(null);
		const handleClickOutside = (e) => {
			const index = buttonRefs.current.findIndex((ref) =>
				ref?.contains(e.target)
			);
			if (index === -1) {
				setShowOptions(null);
			}
			if (
				addMemberRef.current &&
				!addMemberRef.current.contains(e.target) &&
				addMemberInsideRef.current &&
				!addMemberInsideRef.current.contains(e.target)
			) {
				setAddMembersView(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [info]);

	useEffect(() => {
		async function fetchData() {
			await getInfo();
		}
		fetchData();
	}, []);

	return (
		<div className="absolute top-[5%] left-[5%] bg-base-100 outline-2 outline-primary z-10 h-[90%] w-[90%] rounded-2xl py-2 ">
			<div
				onClick={() => setInfoView(false)}
				className=" bg-gray-600 rounded-full size-6 hover:cursor-pointer absolute top-4 right-4 z-5 "
			>
				<lord-icon
					src="https://cdn.lordicon.com/nqtddedc.json"
					trigger="hover"
					className="size-6"
				></lord-icon>
			</div>
			<div className="relative h-full w-full rounded-2xl overflow-auto my-2 py-2">
				<div className="flex justify-center rounded-full ">
					<div className=" flex relative rounded-full ">
						<img
							src={
								!info.groupPic
									? DefaultGroupAvatar
									: info.groupPic
							}
							alt=""
							className="size-60 rounded-full "
						/>
						<label htmlFor="changePic">
							<img
								src={Camera}
								alt=""
								className="size-14 hover:brightness-125 rounded-full absolute bottom-4 right-[5.6rem] hover:cursor-pointer"
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
				<div>
					<div className="mx-6">Name :-</div>
					<div className="flex justify-between mx-4 items-center">
						<input
							type="text"
							className="bg-accent text-accent-content brightness-125 focus:brightness-100 rounded-xl p-2 m-2"
							defaultValue={info.name}
							onFocus={() => setNameFocus(true)}
							onBlur={(e) => {
								setTimeout(() => setNameFocus(false), 100);
							}}
							onChange={(e) => setName(e.target.value)}
						/>
						{nameFocus && (
							<button
								onMouseDown={(e) => e.preventDefault()}
								onClick={() => {
									changeGroupName(name);
									document.activeElement.blur();
								}}
								className="bg-primary text-accent-content brightness-125 hover:brightness-100 p-2 m-2 rounded-3xl hover:cursor-pointer"
							>
								change
							</button>
						)}
					</div>
					<div className="mx-6">Description :-</div>
					<div className="flex justify-between mx-4 items-center ">
						<textarea
							className="bg-accent text-accent-content brightness-125 focus:brightness-100 rounded-xl p-2 m-2 w-[60%] h-24 resize-none overflow-y-auto"
							defaultValue={info.groupDescription}
							onFocus={() => setDescriptionFocus(true)}
							onBlur={() =>
								setTimeout(
									() => setDescriptionFocus(false),
									100
								)
							}
							onChange={(e) => setDescription(e.target.value)}
						/>

						{descriptionFocus && (
							<button
								onMouseDown={(e) => e.preventDefault()}
								onClick={() => {
									changeGroupDescription(description);
									document.activeElement.blur();
								}}
								className="bg-primary text-accent-content brightness-125 hover:brightness-100 p-2 m-2 rounded-3xl hover:cursor-pointer"
							>
								change
							</button>
						)}
					</div>
				</div>
				<div className="my-2 mx-6 ">
					<div className="flex justify-between items-center mb-2 relative">
						<span>Members:-</span>

						<div
							className="flex gap-2 p-2 mr-3 ml-20  bg-secondary rounded-2xl text-secondary-content brightness-125 focus:brightness-100 hover:brightness-100 hover:cursor-pointer"
							ref={addMemberRef}
							onClick={(e) => {
								setAddMembersView(true);
							}}
						>
							<span>Add Members </span>
							<UserPlus />
						</div>
						{addMembersView && (
							<AddMember
								ref={addMemberInsideRef}
								originalRef={addMemberRef}
							/>
						)}
					</div>

					<div className="bg-base-300 outline-2 outline-base-content rounded-2xl p-3 gap-2 flex flex-col ">
						{info &&
							info.members &&
							info.admins &&
							info.members.map((member, index) => (
								<div
									key={index}
									ref={(e) => (buttonRefs.current[index] = e)}
									onClick={() => {
										setShowOptions(member._id);
									}}
									className="bg-primary p-3 rounded-2xl relative text-primary-content flex justify-between items-center hover:cursor-pointer"
								>
									<div className="flex items-center gap-3 ">
										<img
											src={
												member.profilePic
													? member.profilePic
													: DefaultAvatar
											}
											className="size-10 rounded-full"
											onClick={(e) => {
												e.preventDefault();
												setFullScreenImage(
													e.target.src
												);
											}}
										/>
										<span>
											{member.name}{" "}
											{member._id === authUser._id
												? " (You) "
												: ""}
										</span>
									</div>
									{info?.admins?.includes(member._id) ? (
										<Crown />
									) : (
										""
									)}
									{showOptions === member._id &&
										authUser._id !== member._id && (
											<div className="absolute top-[100%]  text-sm sm:text-balance left-[30%] w-[40%] lg:left-[40%] lg:w-[20%] z-10 bg-base-100 text-base-content p-2 rounded-2xl outline-2 outline-base-content">
												<div className="flex flex-col gap-2">
													<div
														className="flex justify-between hover:bg-base-300 rounded-2xl p-2"
														onClick={(e) => {
															setSelectedUser(
																member
															);
															setSidebarType(
																"user"
															);
														}}
													>
														<span> Message </span>
														<MessageCircle />
													</div>
													{selectedGroup.admins.includes(
														authUser._id
													) &&
														!selectedGroup.admins.includes(
															member._id
														) && (
															<div
																className="flex justify-between items-center hover:bg-base-300 rounded-2xl p-2"
																onClick={(e) =>
																	makeAdmin(
																		member
																	)
																}
															>
																<span>
																	Make Admin
																</span>
																<Crown />
															</div>
														)}
													{selectedGroup.admins.includes(
														authUser._id
													) &&
														!selectedGroup.admins.includes(
															member._id
														) && (
															<div
																className="flex justify-between hover:bg-red-700 rounded-2xl p-2"
																onClick={(e) =>
																	removeMember(
																		member
																	)
																}
															>
																<span>
																	Remove
																</span>
																<UserRoundMinus />
															</div>
														)}
												</div>
											</div>
										)}
								</div>
							))}
					</div>
					<button
						className="mt-6 p-2 flex gap-2 rounded-2xl bg-red-600 hover:bg-red-500 "
						onClick={() => exitGroup()}
					>
						<div>Exit</div>
						<LogOut />
					</button>
				</div>
			</div>
		</div>
	);
};

export default GroupEditPage;
