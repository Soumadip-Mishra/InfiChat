import { useEffect, useState, useRef } from "react";
import { ChevronDown, ChevronUp, Search, X } from "lucide-react";
import { useMessageStore } from "../../../store/messageStore";
import { useGlobalStore } from "../../../store/globalStore";
import DefaultAvatar from "../../../assets/default-avatar.jpg";
import Send from "../../../assets/send.svg";
import TypingComponent from "../TypingComponent";
import HighlightText from "../HighlightText";

const Chatbox = () => {
	let currdate = "";
	const [text, setText] = useState("");
	const [image, setImage] = useState(null);
	const [file, setFile] = useState(null);
	const [searchText, setSearchText] = useState("");
	const [searchArray, setSearchArray] = useState([]);
	const endDiv = useRef(null);
	const messageRefs = useRef([]);
	const [searchIndex, setSearchIndex] = useState(-1);

	const checkNewDate = (date) => {
		if (new Date(date).toLocaleDateString() === currdate) return false;
		else {
			currdate = new Date(date).toLocaleDateString();
			return true;
		}
	};
	const {
		usersTyping,
		sendMessage,
		fetchMessages,
		messages,
		addTyping,
		removeTyping,
	} = useMessageStore();
	const { selectedUser, setSelectedUser, setFullScreenImage } =
		useGlobalStore();

	const handleTextChange = (e) => {
		setText(e.target.value);
	};
	const imageAddition = (e) => {
		if (e.target.files && e.target.files[0]) {
			setImage(URL.createObjectURL(e.target.files[0]));

			setFile(e.target.files[0]);
		}
	};
	const removeImage = (e) => {
		setImage(null);
		setFile(null);
	};
	const handleSend = (e) => {
		sendMessage(text, file);
		setText("");
		setFile(null);
		setImage(null);
	};
	const handleFocus = (e) => {
		addTyping();
	};
	const handleBlur = (e) => {
		removeTyping();
	};
	const handleSearchTextChange = (e) => {
		setSearchText(e.target.value);
		const currSearchText = e.target.value;
		setSearchIndex(-1);
		const arr = [];
		messages.map((ele, index) => {
			const words = ele.text.split(/\s+/);
			const match = words.some((word) =>
				word.toLowerCase().startsWith(currSearchText.toLowerCase())
			);
			if (match) arr.push(index);
		});

		setSearchArray(arr);
	};

	const handleArrowUp = () => {
		if (!searchText || searchIndex == 0 || !searchArray) return;
		else {
			const currIndex =
				searchIndex == -1 ? searchArray.length - 1 : searchIndex - 1;
			setSearchIndex(currIndex);
			messageRefs.current[searchArray[currIndex]]?.scrollIntoView({
				behavior: "smooth",
			});
		}
	};
	const handleArrowDown = () => {
		if (
			!searchText ||
			!searchArray ||
			searchIndex == searchArray.length - 1
		)
			return;
		else {
			const currIndex =
				searchIndex == -1 ? searchArray.length - 1 : searchIndex + 1;
			setSearchIndex(currIndex);
			messageRefs.current[searchArray[currIndex]]?.scrollIntoView({
				behavior: "smooth",
			});
		}
	};

	useEffect(() => {
		setText("");
		setImage(null);
		setFile(null);
		setSearchText("");
		setSearchArray([]);
		setSearchIndex(-1);
		fetchMessages();
	}, [selectedUser]);

	useEffect(() => {
		endDiv.current?.scrollIntoView({ behavior: "auto" });
		if (
			searchText &&
			messages &&
			messages[messages.length - 1].text.startsWith(searchText)
		) {
			const arr = [...searchArray, messages.length - 1];
			setSearchArray(arr);
		}
	}, [messages]);

	return (
		<div className="bg-base-100 rounded-2xl flex flex-col  justify-between h-[100%] gap-2 relative">
			<div className="flex justify-between bg-base-300 items-center rounded-2xl px-2 ">
				<div className="  p-2  position relative flex gap-5 items-center  ">
					<img
						src={
							selectedUser.profilePic
								? selectedUser.profilePic
								: DefaultAvatar
						}
						alt=""
						className="size-10 rounded-full hover:cursor-pointer"
						onClick={() =>
							setFullScreenImage(
								selectedUser.profilePic
									? selectedUser.profilePic
									: DefaultAvatar
							)
						}
					/>

					<span className="flex flex-col overflow-hidden ">
						{selectedUser.name}
						{usersTyping.has(selectedUser._id) ? (
							<TypingComponent />
						) : (
							""
						)}
					</span>
				</div>
				<div className="flex gap-0 w-[60%] justify-end items-center">
					<ChevronUp
						size={50}
						className={
							!searchText
								? "text-base-300"
								: "hover:cursor-pointer"
						}
						onClick={handleArrowUp}
					/>
					<ChevronDown
						size={50}
						className={
							!searchText
								? "text-base-300"
								: "hover:cursor-pointer"
						}
						onClick={handleArrowDown}
					/>
					<div className=" mx-2 flex w-full items-center shrink focus-within:outline-2 outline-1  rounded-2xl p-1 bg-base-300 ">
						<div className="flex gap-2 w-full shrink">
							<Search className="" />
							<input
								type="text"
								value={searchText}
								onChange={handleSearchTextChange}
								placeholder="Search Message"
								className="outline-0 p-0 w-full shrink "
								onKeyDown={(e) =>
									e.key === "Enter" ? handleArrowUp() : ""
								}
							/>
						</div>
						{searchText && (
							<X
								onClick={() => {
									setSearchText("");
									setSearchIndex(-1);
								}}
								className="hover:cursor-pointer flex-none"
								size={16}
							/>
						)}
					</div>
					<div
						onClick={() => setSelectedUser(null)}
						className=" bg-gray-600 rounded-full size-6 hover:cursor-pointer ml-2  lg:ml-4"
					>
						<lord-icon
							src="https://cdn.lordicon.com/nqtddedc.json"
							trigger="hover"
							className="size-6"
						></lord-icon>
					</div>
				</div>
			</div>

			<div className="flex flex-col overflow-auto h-[100%] gap-2 bg-base-200 rounded-2xl p-2 ">
				{messages.slice().map((item, index) => {
					return (
						<div
							key={item._id}
							ref={(el) => (messageRefs.current[index] = el)}
						>
							{checkNewDate(item.createdAt) && (
								<div className="flex  justify-center my-3    ">
									<span className="text-shadow-[2px_2px_4px] text-shadow-base-content text-base-content p-2 rounded-2xl">
										{currdate}
									</span>
								</div>
							)}
							{item.recieverID !== selectedUser._id ? (
								<div className="flex flex-col p-1 ">
									<div
										className={`bg-base-300 ${
											searchArray &&
											index != -1 &&
											index == searchArray[searchIndex]
												? "bg-primary"
												: ""
										} p-3  rounded-2xl wrap-break-word  gap-5 overflow-auto mr-auto max-w-[65%]`}
									>
										<div className="flex justify-center ">
											{item.image ? (
												<img
													src={item.image}
													className="max-h-28 hover:cursor-pointer brightness-100"
													onClick={() =>
														setFullScreenImage(
															item.image
														)
													}
												/>
											) : (
												""
											)}
										</div>
										<div>
											<HighlightText
												text={item.text}
												match={searchText}
											/>
										</div>
									</div>
									<div className="text-xs font-semibold ml-1">
										{new Date(
											item.createdAt
										).toLocaleTimeString("en-US", {
											hour: "2-digit",
											minute: "2-digit",
											hour12: false,
										})}
									</div>
								</div>
							) : (
								<div className="flex flex-col p-1 justify-end  ">
									<div
										className={`bg-accent ${
											searchArray &&
											index != -1 &&
											index == searchArray[searchIndex]
												? "bg-primary"
												: ""
										}  text-accent-content p-2 wrap-break-word  rounded-2xl  gap-5  max-w-[65%] mr-0 ml-auto`}
									>
										<div className="flex justify-center ">
											{item.image ? (
												<img
													src={item.image}
													className="max-h-28 hover:cursor-pointer brightness-100"
													onClick={() =>
														setFullScreenImage(
															item.image
														)
													}
												/>
											) : (
												""
											)}
										</div>
										<div className="mr-0 ml-auto ">
											<HighlightText
												text={item.text}
												match={searchText}
											/>
										</div>
									</div>
									<div className=" ml-auto text-xs font-semibold ">
										{new Date(
											item.createdAt
										).toLocaleTimeString("en-US", {
											hour: "2-digit",
											minute: "2-digit",
											hour12: false,
										})}
									</div>
								</div>
							)}
						</div>
					);
				})}
				<div ref={endDiv} />
			</div>

			<div className="flex  justify-between">
				<input
					type="text"
					value={text}
					onChange={handleTextChange}
					onFocus={handleFocus}
					onBlur={handleBlur}
					placeholder="Enter your message"
					className="focus:outline-2 outline-1 w-[60%] rounded-2xl p-2 bg-base-200"
					onKeyDown={(e) => (e.key === "Enter" ? handleSend() : "")}
				/>
				<div className="flex gap-8">
					<div className="bg-base-200 hover:cursor-pointer hover:bg-base-300 rounded-full p-1 flex justify-center items-center">
						<label
							htmlFor="changePic"
							className="hover:cursor-pointer"
						>
							<lord-icon
								src="https://cdn.lordicon.com/rszslpey.json"
								trigger="hover"
								style={{ width: "2rem", height: "2rem" }}
								className="current-color"
							></lord-icon>
						</label>
						<input
							type="file"
							name="image"
							className="hidden"
							id="changePic"
							accept="image/*"
							onChange={imageAddition}
						/>
					</div>
					<div
						className=" hover:cursor-pointer  "
						onClick={handleSend}
					>
						<img
							src={Send}
							className="size-10 hover:brightness-125"
						/>
					</div>
				</div>
			</div>
			{image ? (
				<div className="absolute bottom-14 ">
					<div className="relative">
						<img src={image} className="w-20 z-2" />
						<div
							onClick={removeImage}
							className="top-0 right-0 absolute bg-gray-600 rounded-full size-6 hover:cursor-pointer"
						>
							<lord-icon
								src="https://cdn.lordicon.com/nqtddedc.json"
								trigger="hover"
								className="size-6 "
							></lord-icon>
						</div>
					</div>
				</div>
			) : (
				""
			)}
		</div>
	);
};

export default Chatbox;
