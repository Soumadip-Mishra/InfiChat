import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./authStore";
import { useGlobalStore } from "./globalStore";

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
						`/message/private/get-message/${selectedUser._id}`
				  )
				: await axiosInstance.get(
						`/message/group/${selectedGroup._id}/get-message`
				  );
			set({ messages: res.data });
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
			formData.append("image", file);
			formData.append("text", text);

			const { selectedUser, selectedGroup, setUserFirst, setGroupFirst } =
				useGlobalStore.getState();
			const res = selectedUser
				? await axiosInstance.post(
						`/message/private/send-message/${selectedUser._id}`,
						formData
				  )
				: await axiosInstance.post(
						`/message/group/${selectedGroup._id}/send-message`,
						formData
				  );

			set({ messages: [...get().messages, res.data] });
			if (selectedUser) setUserFirst(selectedUser._id);
			if (selectedGroup) setGroupFirst(selectedGroup._id);
		} catch (error) {
			console.log("Error in sending message", error);
		}
	},
	addTyping: async () => {
		try {
			const res = await axiosInstance.post(
				`/message/add-typing/${
					useGlobalStore.getState().selectedUser
						? useGlobalStore.getState().selectedUser._id
						: useGlobalStore.getState().selectedGroup._id
				}`,
				{
					group: useGlobalStore.getState().selectedUser
						? false
						: true,
				}
			);
		} catch (error) {
			console.log("error", error);
		}
	},
	removeTyping: async () => {
		try {
			const res = await axiosInstance.post(
				`/message/remove-typing/${
					useGlobalStore.getState().selectedUser
						? useGlobalStore.getState().selectedUser._id
						: useGlobalStore.getState().selectedGroup._id
				}`,
				{
					group: useGlobalStore.getState().selectedUser
						? false
						: true,
				}
			);
		} catch (error) {
			console.log("error", error);
		}
	},
	socketMessageOn: () => {
		const socket = useAuthStore.getState().socket;
		socket.on("newMessage", (newMessage) => {
			const { selectedUser, selectedGroup, setUserFirst, setGroupFirst } =
				useGlobalStore.getState();

			if (newMessage.type === "user") {
				const message = newMessage.message;
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
				if (count){
                    newMap.set(gID,count+1);
                }
                else{
                    newMap.set(gID,1);
                }
                set({groupsTyping : newMap})
				
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
				if (!count || (count && count==1)){
                    newMap.delete(gID);
                }
                else{
                    newMap.set(gID,count-1);
                }
                set({groupsTyping : newMap})
				
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
