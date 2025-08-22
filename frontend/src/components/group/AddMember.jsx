import { useState, forwardRef } from "react";
import { Search, X } from "lucide-react";
import { useGroupStore } from "../../store/groupStore";
import { useGlobalStore } from "../../store/globalStore";
import DefaultAvatar from "../../assets/default-avatar.jpg";

const AddMember = forwardRef((props, ref) => {
	const { users } = useGlobalStore();
	const { addMembers } = useGroupStore();

	const [searchText, setSearchText] = useState("");
	const [membersToAdd, setMembersToAdd] = useState([]);
	const handleUserClick = (memberID) => {
		if (membersToAdd.includes(memberID)) {
			setMembersToAdd(membersToAdd.filter((id) => id !== memberID));
		} else {
			setMembersToAdd([...membersToAdd, memberID]);
		}
	};

	return (
		<div
			className="absolute top-[100%] right-0 bg-base-100 rounded-2xl outline-2 outline-base-content w-72 mt-1 z-30 h-96"
			ref={ref}
		>
			<div className=" h-[90%] flex flex-col w-full gap-2  overflow-auto my-2 p-2 ">
				<div className="flex w-full justify-between gap-2 sticky top-0 z-3 ">
					<div className="flex  items-center  top-0   focus-within:outline-2 outline-1  rounded-2xl p-1 bg-base-300">
						<div className="flex gap-2 align ">
							<Search />
							<input
								type="text"
								value={searchText}
								onChange={(e) => setSearchText(e.target.value)}
								placeholder="Search Users"
								className="outline-0 p-0 w-[50%] "
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
					<button
						className="bg-accent text-accent-content p-2  rounded-2xl hover:brightness-125 hover:cursor-pointer"
						onClick={() => {
							addMembers(membersToAdd);
						}}
					>
						Add
					</button>
				</div>

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
});

export default AddMember;
