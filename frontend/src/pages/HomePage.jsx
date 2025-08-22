import { useEffect } from "react";
import { useMessageStore } from "../store/messageStore";
import { useGlobalStore } from "../store/globalStore";
import { useGroupStore } from "../store/groupStore";
import Sidebar from "../components/Sidebar";
import Chatbox from "../components/chat/private-chat/Chatbox";
import Community from "../assets/community.jpg";
import LaptopChat from "../assets/laptop-chat.png";
import AiChatBox from "../components/chat/ai-chat/AiChatBox";
import GroupChatBox from "../components/chat/group-chat/GroupChatBox";
import GroupEditPage from "../components/group/GroupEditPage";
import CreateGroup from "../components/group/CreateGroup";

const HomePage = () => {
	const { socketMessageOn, socketMessageOff } = useMessageStore();
	const {
		selectedUser,
		selectedGroup,
	} = useGlobalStore();
	const {
		infoView,
		createGroupView,
	} = useGroupStore();
	useEffect(() => {
		socketMessageOn();
		return () => {
			socketMessageOff();
		};
	}, [socketMessageOn, socketMessageOff]);

	return (
		<div className="h-[calc(100vh-3rem)] p-1 relative ">
			<div className="grid grid-cols-8 grid-rows-1  gap-2   rounded-2xl h-full relative">
				<div
					className={
						!selectedUser && !selectedGroup && !createGroupView
							? "col-span-8 sm:col-span-3 lg:col-span-2 outline-2  outline-accent p-4 rounded-2xl "
							: "hidden sm:block sm:col-span-3 lg:col-span-2 outline-2  outline-accent p-4 rounded-2xl "
					}
				>
					<Sidebar />
				</div>
				<div
					className={
						createGroupView || selectedUser || selectedGroup
							? "col-span-8 sm:col-span-5 lg:col-span-6 outline-2  outline-accent  p-1 oveflow-auto h-[100%]  rounded-2xl"
							: "hidden sm:block sm:col-span-5 lg:col-span-6 outline-2  outline-accent p-1 oveflow-auto h-[100%]  rounded-2xl"
					}
				>
					{createGroupView ? (
						<CreateGroup />
					) : selectedUser ? (
						selectedUser === "Ai" ? (
							<AiChatBox />
						) : (
							<Chatbox />
						)
					) : selectedGroup ? (
						<div className="h-full w-full relative">
							{infoView && <GroupEditPage />}
							<GroupChatBox />
						</div>
					) : (
						<div>
							<div className=" h-[calc(100vh-5rem)] flex flex-col gap-16  bg-base-200 justify-around m-2 rounded-2xl  ">
								<div className="flex py-2 justify-around items-center gap-16 mt-10">
									<div className="flex flex-col items-center">
										<img
											src={Community}
											alt=""
											className="w-50 h-40 rounded-[50%]"
										/>

										<div className="animate-bounce flex justify-center my-20 ">
											<span className="animate-pulse  rainbow-text bg-linear-to-r/decreasing from-violet-700 via-lime-300 to-violet-700">
												Welcome to InfiChat
											</span>
										</div>
									</div>
									<div className="flex flex-col items-center">
										<img
											src={LaptopChat}
											alt=""
											className="size-40 rounded-4xl"
										/>
										<div className=" flex justify-center my-20 ">
											<span className="rotating-text rainbow-text bg-linear-to-r/decreasing from-violet-700 via-lime-300 to-violet-700">
												Message to the end of your heart
											</span>
										</div>
									</div>
								</div>
								<div>
									<ul className="ml-[25%] mb-20 list-disc">
										<li>
											Chat infinitely with you friends ,
											privately or in groups.
										</li>
										<li>
											Have no-one to chat ? Try Infi-AI.
										</li>
									</ul>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default HomePage;
