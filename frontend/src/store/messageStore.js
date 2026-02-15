import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./authStore";
import { useGlobalStore } from "./globalStore";
import {
	computeSharedSecret,
	encryptMessage,
	decryptMessage,
	encryptImage,
	decryptImage,
} from "../lib/crypto";

export const useMessageStore = create((set, get) => ({
	userSidebar: true,
	selectedUser: null,
	selectedGroup: null,
	fullScreenImage: "",
	messages: [],
	users: [],
	groups: [],
	groupInfo: true,
	usersTyping: new Set(),
	groupsTyping: new Map(),
	fetchMessages: async () => {
		if (
			!useGlobalStore.getState().selectedUser &&
			!useGlobalStore.getState().selectedGroup
		)
			return;
		try {
			if (useGlobalStore.getState().selectedUser)
				get().fetchPrivateMessages();
			else if (useGlobalStore.getState().selectedGroup)
				get().fetchGroupMessages();
		} catch (error) {
			console.error("Error in fetching messages", error);
		}
	},
	fetchPrivateMessages: async () => {
		try {
			const { selectedUser } = useGlobalStore.getState();
			const res = await axiosInstance.get(
				`/message/private/get-message/${selectedUser._id}`,
			);
			let currMessages = res.data;

			const sharedSecret = await computeSharedSecret(
				localStorage.getItem("privateKey"),
				selectedUser.publicKey,
			);

			currMessages = await Promise.all(
				currMessages.map(async (message) => {
					if (message.text) {
						message.text = await decryptMessage(
							message.text,
							sharedSecret,
						);
					}
					if (message.image) {
						message.image = await decryptImage(
							message.image,
							sharedSecret,
						);
					}
					return message;
				}),
			);
			set({ messages: currMessages });
		} catch (error) {
			console.error("Error in fetching private messages", error);
		}
	},
	fetchGroupMessages: async () => {
		try {
			const { selectedGroup } = useGlobalStore.getState();
			const res = await axiosInstance.get(
				`/message/group/${selectedGroup._id}/get-message`,
			);
			let currMessages = res.data;

			currMessages = await Promise.all(
				currMessages.map(async (message) => {
					let senderPublicKey = useGlobalStore
						.getState()
						.users.find(
							(user) =>
								user._id.toString() ===
								message.senderID.toString(),
						)?.publicKey;

					if (!senderPublicKey)
						senderPublicKey =
							useAuthStore.getState().authUser.publicKey;

					const sharedSecret = await computeSharedSecret(
						localStorage.getItem("privateKey"),
						senderPublicKey,
					);
					if (message.text) {
						message.text = await decryptMessage(
							message.text,
							sharedSecret,
						);
					}
					if (message.image) {
						message.image = await decryptImage(
							message.image,
							sharedSecret,
						);
					}
					return message;
				}),
			);

			set({ messages: currMessages });
		} catch (error) {
			console.error("Error in fetching group messages", error);
		}
	},

	sendMessage: async (text, file) => {
		if (!text.trim() && !file) {
			toast.error("Message cannot be empty");
			return;
		}
		try {
			if (useGlobalStore.getState().selectedUser)
				await get().sendPrivateMessage(text, file);
			else if (useGlobalStore.getState().selectedGroup)
				await get().sendGroupMessage(text, file);
			return;
		} catch (error) {
			console.error("Error in sending message", error);
		}
	},
	sendPrivateMessage: async (text, file) => {
		try {
			const { selectedUser, setUserFirst } = useGlobalStore.getState();
			const formData = new FormData();
			const sharedSecret = await computeSharedSecret(
				localStorage.getItem("privateKey"),
				selectedUser.publicKey,
			);
			if (text) {
				const encryptedMessage = await encryptMessage(
					text,
					sharedSecret,
				);
				formData.append("text", encryptedMessage);
			}
			if (file) {
				const encryptedFile = await encryptImage(file, sharedSecret);
				formData.append("image", encryptedFile);
			}

			const res = await axiosInstance.post(
				`/message/private/send-message/${selectedUser._id}`,
				formData,
			);
			const currMessage = res.data;
			currMessage.text = text;
			currMessage.image = file
				? await decryptImage(currMessage.image, sharedSecret)
				: null;
			set({ messages: [...get().messages, currMessage] });
			setUserFirst(selectedUser._id);
		} catch (error) {
			console.error("Error in sending private message", error);
		}
	},
	sendGroupMessage: async (text, file) => {
		try {
			const { selectedGroup, setGroupFirst } = useGlobalStore.getState();
			await Promise.all(
				selectedGroup.members.map(async (memberID) => {
					const member = useGlobalStore
						.getState()
						.users.find(
							(user) =>
								user._id.toString() === memberID.toString(),
						);
					if (!member) return;
					const formData = new FormData();
					const sharedSecret = await computeSharedSecret(
						localStorage.getItem("privateKey"),
						member.publicKey,
					);
					if (text) {
						const encryptedMessage = await encryptMessage(
							text,
							sharedSecret,
						);
						formData.append("text", encryptedMessage);
					}
					if (file) {
						const encryptedFile = await encryptImage(
							file,
							sharedSecret,
						);
						formData.append("image", encryptedFile);
					}

					formData.append("recieverID", memberID);
					await axiosInstance.post(
						`/message/group/${selectedGroup._id}/send-message`,
						formData,
					);
				}),
			);

			{
				const formData = new FormData();
				const sharedSecret = await computeSharedSecret(
					localStorage.getItem("privateKey"),
					useAuthStore.getState().authUser.publicKey,
				);
				if (text) {
					const encryptedMessage = await encryptMessage(
						text,
						sharedSecret,
					);
					formData.append("text", encryptedMessage);
				}
				if (file) {
					const encryptedFile = await encryptImage(
						file,
						sharedSecret,
					);
					formData.append("image", encryptedFile);
				}

				formData.append(
					"recieverID",
					useAuthStore.getState().authUser._id,
				);

				const res = await axiosInstance.post(
					`/message/group/${selectedGroup._id}/send-message`,
					formData,
				);
				const currMessage = res.data;
				currMessage.text = text;
				currMessage.image = file
					? await decryptImage(currMessage.image, sharedSecret)
					: null;
				set({ messages: [...get().messages, currMessage] });
				setGroupFirst(selectedGroup._id);
			}
		} catch (error) {
			console.error("Error in sending group message", error);
		}
	},

	addTyping: async () => {
		try {
			await axiosInstance.post(
				`/message/add-typing/${
					useGlobalStore.getState().selectedUser
						? useGlobalStore.getState().selectedUser._id
						: useGlobalStore.getState().selectedGroup._id
				}`,
				{
					group: useGlobalStore.getState().selectedUser
						? false
						: true,
				},
			);
		} catch (error) {
			console.error("Error in addTyping socket", error);
		}
	},

	removeTyping: async () => {
		try {
			await axiosInstance.post(
				`/message/remove-typing/${
					useGlobalStore.getState().selectedUser
						? useGlobalStore.getState().selectedUser._id
						: useGlobalStore.getState().selectedGroup._id
				}`,
				{
					group: useGlobalStore.getState().selectedUser
						? false
						: true,
				},
			);
		} catch (error) {
			console.error("Error in removeTyping socket", error);
		}
	},

	socketMessageOn: () => {
		const socket = useAuthStore.getState().socket;
		socket.on("newMessage", async (newMessage) => {
			const { selectedUser, selectedGroup, setUserFirst, setGroupFirst } =
				useGlobalStore.getState();
			const message = newMessage.message;

			const senderPublicKey = useGlobalStore
				.getState()
				.users.find((user) => user._id === message.senderID)?.publicKey;

			if (!senderPublicKey) return;

			const sharedSecret = await computeSharedSecret(
				localStorage.getItem("privateKey"),
				senderPublicKey,
			);
			if (message.text) {
				message.text = await decryptMessage(message.text, sharedSecret);
			}
			if (message.image) {
				message.image = await decryptImage(message.image, sharedSecret);
			}
			if (newMessage.type === "user") {
				setUserFirst(message.senderID);
				if (selectedUser?._id === message.senderID)
					set({ messages: [...get().messages, message] });
			} else {
				setGroupFirst(message.groupID);
				if (selectedGroup?._id === message.groupID)
					set({ messages: [...get().messages, message] });
			}
		});

		socket.on("addTyping", (typing) => {
			if (typing.group) {
				let gID = typing.gID.toString();
				const newMap = new Map(get().groupsTyping);
				let count = newMap.get(gID);
				if (count) {
					newMap.set(gID, count + 1);
				} else {
					newMap.set(gID, 1);
				}
				set({ groupsTyping: newMap });
			} else {
				const newSet = new Set(get().usersTyping);
				newSet.add(typing.sID);
				set({ usersTyping: newSet });
			}
		});

		socket.on("removeTyping", (typing) => {
			if (typing.group) {
				let gID = typing.gID.toString();
				const newMap = new Map(get().groupsTyping);
				let count = newMap.get(gID);
				if (!count || (count && count == 1)) {
					newMap.delete(gID);
				} else {
					newMap.set(gID, count - 1);
				}
				set({ groupsTyping: newMap });
			} else {
				const newSet = new Set(get().usersTyping);
				newSet.delete(typing.sID);
				set({ usersTyping: newSet });
			}
		});
	},

	socketMessageOff: () => {
		const socket = useAuthStore.getState().socket;
		socket?.off("newMessage");
		socket?.off("addTyping");
		socket?.off("removeTyping");
	},
}));
