import { useState } from "react";
import { Search, X } from "lucide-react";
import { useGroupStore } from "../../store/groupStore";
import { useGlobalStore } from "../../store/globalStore";
import DefaultAvatar from "../../assets/default-avatar.jpg";

const CreateGroup = () => {
	const { users } = useGlobalStore();
	const { createGroup, setCreateGroupView } = useGroupStore();
	const [searchText, setSearchText] = useState("");
	const [name, setName] = useState("");
	const [membersToAdd, setMembersToAdd] = useState([]);

	const handleUserClick = (memberID) => {
		if (membersToAdd.includes(memberID)) {
			setMembersToAdd(membersToAdd.filter((id) => id !== memberID));
		} else {
			setMembersToAdd([...membersToAdd, memberID]);
		}
	};

	return (
		<div className="relative h-full overflow-auto p-2">
			<div className="sticky top-0 w-full flex justify-around z-5">
				<button
					className="bg-red-600 p-2 rounded-2xl hover:bg-red-400 hover:cursor-pointer"
					onClick={() => setCreateGroupView(false)}
				>
					<div>Cancel</div>
				</button>
				<button
					className="bg-green-600 p-2 rounded-2xl hover:bg-green-400 hover:cursor-pointer"
					onClick={() => createGroup(name, membersToAdd)}
				>
					<div>Create</div>
				</button>
			</div>
			<div className="mt-6">
				<div className="mx-6">Name :-</div>
				<div className="flex justify-between mx-4 items-center">
					<input
						type="text"
						className="bg-secondary text-secondary-content brightness-125 focus:brightness-100 rounded-xl p-2 m-2"
						defaultValue={name}
						onChange={(e) => setName(e.target.value)}
					/>
				</div>
			</div>
			<div className="mx-6 mt-3">Add Users:-</div>
			<div className="flex justify-center  gap-10 overflow-auto p-2 bg-bl mx-3 mt-2">
				<div className="flex  items-center w-[80%] sm:w-[50%] sticky top-0 z-3 overflow-hidden focus-within:outline-2 outline-1  rounded-2xl p-1 bg-base-300">
					<div className="flex gap-2 align grow">
						<Search className="" />
						<input
							type="text"
							value={searchText}
							onChange={(e) => setSearchText(e.target.value)}
							placeholder="Search Users"
							className="outline-0 p-0 grow"
							onKeyDown={(e) =>
								e.key === "Enter" ? handleSend() : ""
							}
						/>
					</div>
					{searchText && (
						<X
							onClick={(e) => setSearchText("")}
							className="hover:cursor-pointer flex-none"
							size={16}
						/>
					)}
				</div>
			</div>
			<div className="h-[60%] mx-[10%] w-[80%] sm:mx-[25%] sm:w-[50%] fl ex flex-col gap-3 p-2  rounded-2xl overflow-auto outline-base-content outline-2">
				{users.map((user, index) =>
					user.name
						.toLowerCase()
						.startsWith(searchText.toLowerCase()) ? (
						<button
							key={index}
							id={index}
							onClick={() => handleUserClick(user._id)}
							className={`${
								membersToAdd.includes(user._id)
									? "bg-base-300 outline-1 "
									: "bg-base-200"
							} hover:cursor-pointer  flex items-center h-16  gap-4 p-2 rounded-2xl `}
						>
							<div className="size-10 rounded-full relative shrink-0">
								<img
									src={
										user.profilePic
											? user.profilePic
											: DefaultAvatar
									}
									className="size-10 rounded-full "
								/>
							</div>
							<div className="flex justify-center items-center overflow-hidden p-1  w-[100%]">
								<div className="flex items-center gap-2 w-[100%]">
									<span className=" overflow-x-auto">
										{user.name}
									</span>
								</div>
							</div>
						</button>
					) : (
						""
					)
				)}
			</div>
		</div>
	);
};

export default CreateGroup;
