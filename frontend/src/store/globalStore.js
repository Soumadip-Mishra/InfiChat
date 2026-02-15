import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { Toaster } from "react-hot-toast";
import { useGroupStore } from "./groupStore";

export const useGlobalStore = create((set, get) => ({
	sidebarType: "user",
	selectedUser: null,
	selectedGroup: null,
	fullScreenImage: "",
	users: [],
	groups: [],
	setSidebarType: async (value) => {
		set({ sidebarType: value });
	},
	setUsers: (item) => {
		set({ users: item });
	},
	setGroups: (item) => {
		set({ groups: item });
	},
	getUsers: async () => {
		try {
			const allusersResponse = await axiosInstance.get(
				"/message/users-sidebar"
			);
			const allusers = allusersResponse.data;
			set({ users: allusers });
		} catch (error) {
			console.error("Error in loading users", error);
		}
	},
	getGroups: async () => {
		try {
			const allGroupsResponse = await axiosInstance.get("/group/sidebar");
			const allGroups = allGroupsResponse.data;
			set({ groups: allGroups });
		} catch (error) {
			console.error("Error in loading groups", error);
		}
	},
	setUserFirst: async (userID) => {
		let arr = await get().users.filter((ele) => ele._id === userID);
		let brr = await get().users.filter((ele) => ele._id !== userID);
		await arr.push(...brr);
		set({ users: arr });
	},
	setGroupFirst: async (groupID) => {
		let arr = await get().groups.filter((ele) => ele._id === groupID);
		let brr = await get().groups.filter((ele) => ele._id !== groupID);
		await arr.push(...brr);
		set({ groups: arr });
	},
	setSelectedUser: async (item) => {
		try {
			set({ selectedUser: item });
			set({ selectedGroup: null });
		} catch (error) {
			console.error("Error in loading user", error);
		}
	},
	setSelectedGroup: async (item) => {
		try {
			set({ selectedGroup: item });
			useGroupStore.getState().setInfoView(false);
			set({ selectedUser: null });
		} catch (error) {
			console.error("Error in loading group", error);
		}
	},
	setFullScreenImage: async (item) => {
		try {
			set({ fullScreenImage: item });
		} catch (error) {
			console.error("Error in loading full screen image", error);
		}
	},
}));
