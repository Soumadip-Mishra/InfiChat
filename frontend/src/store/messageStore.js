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
			const { selectedUser, selectedGroup } = useGlobalStore.getState();
			const res = selectedUser
				? await axiosInstance.get(
						`/message/private/get-message/${selectedUser._id}`,
					)
				: await axiosInstance.get(
						`/message/group/${selectedGroup._id}/get-message`,
					);
			let currMessages = res.data;
			if (selectedUser) {
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
			}
			set({ messages: currMessages });
		} catch (error) {
			console.log("error", error);
		}
	},

	sendMessage: async (text, file) => {
		if (!text.trim() && !file) {
			toast.error("Message cannot be empty");
			return;
		}
		if (
			!useGlobalStore.getState().selectedUser &&
			!useGlobalStore.getState().selectedGroup
		)
			return;
		try {
			const formData = new FormData();
			const { selectedUser, selectedGroup, setUserFirst, setGroupFirst } =
				useGlobalStore.getState();

			if (text && selectedUser) {
				const sharedSecret = await computeSharedSecret(
					localStorage.getItem("privateKey"),
					selectedUser.publicKey,
				);
				const encryptedMessage = await encryptMessage(
					text,
					sharedSecret,
				);
				formData.append("text", encryptedMessage);
			}

			if (file && selectedUser) {
				const sharedSecret = await computeSharedSecret(
					localStorage.getItem("privateKey"),
					selectedUser.publicKey,
				);
				const encryptedFile = await encryptImage(file, sharedSecret);
				formData.append("image", encryptedFile);
			}

			const res = selectedUser
				? await axiosInstance.post(
						`/message/private/send-message/${selectedUser._id}`,
						formData,
					)
				: await axiosInstance.post(
						`/message/group/${selectedGroup._id}/send-message`,
						formData,
					);

			const currMessage = res.data;
			currMessage.text = text;
			const sharedSecret = await computeSharedSecret(
				localStorage.getItem("privateKey"),
				selectedUser ? selectedUser.publicKey : null,
			);
			currMessage.image = file
				? await decryptImage(currMessage.image, sharedSecret)
				: null;

			set({ fullScreenImage: currMessage.image });

			set({ messages: [...get().messages, currMessage] });
			if (selectedUser) setUserFirst(selectedUser._id);
			if (selectedGroup) setGroupFirst(selectedGroup._id);
		} catch (error) {
			console.log("Error in sending message", error);
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
			console.log("error", error);
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
			console.log("error", error);
		}
	},

	socketMessageOn: () => {
		const socket = useAuthStore.getState().socket;
		socket.on("newMessage", async (newMessage) => {
			const { selectedUser, selectedGroup, setUserFirst, setGroupFirst } =
				useGlobalStore.getState();

			if (newMessage.type === "user") {
				const message = newMessage.message;

				const senderPublicKey = useGlobalStore
					.getState()
					.users.find(
						(user) => user._id === message.senderID,
					).publicKey;

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

				setUserFirst(message.senderID);
				if (selectedUser?._id === message.senderID)
					set({ messages: [...get().messages, message] });
			} else {
				const message = newMessage.message;
				setGroupFirst(message.recieverID);
				if (selectedGroup?._id === message.recieverID)
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
