import React, { useEffect, useState } from "react";
import Avatar from "../assets/default-avatar.jpg";
import GreenDot from "../assets/green-dot.jpg";
import DefaultGroupAvatar from "../assets/default-group-avatar.png";
import Ai from "../assets/ai.png";
import { useMessageStore } from "../store/messageStore";
import { useAuthStore } from "../store/authStore";
import { Search, Users, X } from "lucide-react";
import { useGlobalStore } from "../store/globalStore";
import { useGroupStore } from "../store/groupStore";

export const Sidebar = () => {
	const { usersTyping, groupsTyping } = useMessageStore();
	const {
		sidebarType,
		setSidebarType,
		selectedUser,
		setSelectedUser,
		users,
		getUsers,
		groups,
		getGroups,
		selectedGroup,
		setSelectedGroup,
	} = useGlobalStore();
	const { setCreateGroupView } = useGroupStore();
	const { onlineUsers } = useAuthStore();
	const [sideBarText, setSideBarText] = useState("");

	const handleUserClick = (e) => {
		setSelectedUser(users[e.currentTarget.id]);
	};
	const handleGroupClick = (e) => {
		setSelectedGroup(groups[e.currentTarget.id]);
        
	};
	const handleTextChange = (e) => {
		setSideBarText(e.target.value);
	};
	const handleCross = () => {
		setSideBarText("");
	};
	useEffect(() => {
		getUsers();
		getGroups();
	}, [sidebarType,getUsers,getGroups]);

	return (
		<div className="h-full w-full relative">
			<div className="flex m-2 p-2 justify-around ">
				<div
					className="cursor-pointer "
					onClick={() => {
						setSidebarType("user");
					}}
				>
					<button className="cursor-pointer">Users</button>
					{sidebarType === "user" && (
						<hr className="border-t-4 border-secondary rounded-2xl" />
					)}
				</div>
				<div
					className="hover:cursor-pointer"
					onClick={() => {
						setSidebarType("group");
					}}
				>
					<button className="hover:cursor-pointer">Groups</button>
					{sidebarType === "group" && (
						<hr className="border-t-4 border-secondary rounded-2xl" />
					)}
				</div>
			</div>
			<div className=" h-[90%] flex flex-col gap-2   overflow-auto my-2 p-2 ">
				<div className="flex justify-between ">
					<div
						className={`flex justify-between  items-center min-w-0 ${
							sidebarType === "user" ? "" : "max-w-52"
						} flex-1  sticky top-0 z-3 focus-within:outline-2 outline-1  rounded-2xl p-1 bg-base-300`}
					>
						<div className="flex  min-w-0  ">
							<Search className="" />
							<input
								type="text"
								value={sideBarText}
								onChange={handleTextChange}
								placeholder={`Search ${
									sidebarType === "user" ? "User" : "Group"
								}`}
								className="outline-0 p-0 flex-1  min-w-0 "
							/>
						</div>
						{sideBarText && (
							<X
								onClick={handleCross}
								className="hover:cursor-pointer flex-none"
								size={16}
							/>
						)}
					</div>
					{sidebarType == "group" && (
						<button
							className="flex justify-center items-center bg-accent text-accent-content hover:cursor-pointer hover:brightness-125 rounded-2xl p-2"
							onClick={() => setCreateGroupView(true)}
						>
							<div>Create</div>
							<Users />
						</button>
					)}
				</div>

				{sidebarType === "user" &&
					users.map((user, index) =>
						user.name
							.toLowerCase()
							.startsWith(sideBarText.toLowerCase()) ? (
							<button
								key={index}
								id={index}
								onClick={handleUserClick}
								className={`${
									selectedUser &&
									selectedUser.email === user.email
										? "bg-base-300 outline-1 "
										: "bg-base-200"
								} hover:cursor-pointer  flex items-center h-16  gap-4 p-2 rounded-2xl `}
							>
								<div className="size-10 rounded-full relative shrink-0">
									<img
										src={
											user.profilePic
												? user.profilePic
												: Avatar
										}
										className="size-10 rounded-full "
									/>
									{onlineUsers.includes(user._id) ? (
										<img
											src={GreenDot}
											alt=""
											className="absolute top-1 right-1 rounded-full size-2 z-20"
										/>
									) : (
										""
									)}
								</div>
								<div className="flex justify-center items-center overflow-hidden p-1  w-[100%]">
									<div className="flex items-center gap-2 w-[100%]">
										<span className=" overflow-x-auto">
											{user.name}
										</span>
										{usersTyping.has(user._id) && (
											<span className="loading loading-dots loading-xl text-primary"></span>
										)}
									</div>
								</div>
							</button>
						) : (
							""
						)
					)}
				{sidebarType === "group" &&
					groups.map((group, index) =>
						group.name
							.toLowerCase()
							.startsWith(sideBarText.toLowerCase()) ? (
							<button
								key={index}
								id={index}
								onClick={handleGroupClick}
								className={`${
									selectedGroup &&
									selectedGroup._id === group._id
										? "bg-base-300 outline-1 "
										: "bg-base-200"
								} hover:cursor-pointer  flex items-center h-16  gap-4 p-2 rounded-2xl `}
							>
								<div className="size-10 rounded-full relative shrink-0">
									<img
										src={
											group.groupPic
												? group.groupPic
												: DefaultGroupAvatar
										}
										className="size-10 rounded-full "
									/>
								</div>
								<div className="flex justify-center items-center overflow-hidden p-1  w-[100%]">
									<div className="flex items-center gap-2 w-[100%]">
										<span className=" overflow-x-auto">
											{group.name}
										</span>
										{groupsTyping.has(group._id) && (
											<span className="loading loading-dots loading-xl text-primary"></span>
										)}
									</div>
								</div>
							</button>
						) : (
							""
						)
					)}
			</div>
			<img
				src={Ai}
				onClick={() => setSelectedUser("Ai")}
				className="absolute  bottom-[10%]  right-[8%] rounded-[50%]  size-12  items-end hover:shadow-[0_0_10px_1px_var(--color-blue-900)] hover:brightness-150 hover:cursor-pointer"
			/>
		</div>
	);
};

export default Sidebar;
