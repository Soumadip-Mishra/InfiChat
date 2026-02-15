import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast, { Toaster } from "react-hot-toast";
import { useGlobalStore } from "./globalStore";
import { Truck } from "lucide-react";

export const useGroupStore = create((set, get) => ({
	info: "",
	infoView: false,
	createGroupView: false,
	setInfoView: async (value) => {
		set({ infoView: value });
	},
	setCreateGroupView: async (value) => {
		set({ createGroupView: value });
	},
	createGroup: async (name, members) => {
		try {
			const res = await axiosInstance.post(`group/create-group`, {
				name,
				members,
			});
			set({ createGroupView: false });

			const {groups,setGroups,setSelectedGroup} = useGlobalStore.getState();
			setGroups([...groups, res.data]);
			setSelectedGroup(res.data);

			toast.success(
				"Group create successfully , you can change description and picture"
			);
		} catch (error) {
			console.error("Error creating group", error);
			toast.error(error.response?.data?.message);
		}
	},
	changeGroupName: async (item) => {
		try {
			const res = await axiosInstance.post(
				`group/${
					useGlobalStore.getState().selectedGroup._id
				}/change/group-name`,
				{ name: item }
			);
			useGlobalStore.getState().getGroups();
			let selectedGroup = useGlobalStore.getState().selectedGroup;
			selectedGroup.name = res.data.name;
			useGlobalStore.getState().setSelectedGroup(selectedGroup);
			set({ info: res.data });
			set({ infoView: true });
            
            toast.success("Group name changed successfully");
		} catch (error) {
			console.error("Error changing group name", error);
			toast.error(error.response?.data?.message);
		}
	},
	changeGroupDescription: async (item) => {
		try {
			const res = await axiosInstance.post(
				`group/${
					useGlobalStore.getState().selectedGroup._id
				}/change/group-description`,
				{ description: item }
			);
			set({ info: res.data });
            
            toast.success("Group description changed successfully");
		} catch (error) {
			console.error("Error changing group description", error);
			toast.error(error.response?.data?.message);
		}
	},
	changeGroupPic: async (item) => {
		try {
			const res = await axiosInstance.post(
				`group/${
					useGlobalStore.getState().selectedGroup._id
				}/change/group-pic`,
				item
			);
			useGlobalStore.getState().getGroups();
			let selectedGroup = useGlobalStore.getState().selectedGroup;
			selectedGroup.groupPic = res.data.groupPic;
			useGlobalStore.getState().setSelectedGroup(selectedGroup);

			set({ info: res.data });
			set({ infoView: true });

            toast.success("Group pic changed successfully");
		} catch (error) {
			console.error("Error changing group pic", error);
			toast.error(error.response?.data?.message);
		}
	},
	getInfo: async () => {
		try {
			const groupID = useGlobalStore.getState().selectedGroup?._id;
			if (!groupID) return;
			const res = await axiosInstance.get(`/group/${groupID}/info`);
			set({ info: res.data });
		} catch (error) {
			console.error("Error getting group info", error);
			toast.error(error.response?.data?.message);
		}
	},
	addMembers: async (item) => {
		try {
			const groupID = useGlobalStore.getState().selectedGroup?._id;
			if (!groupID) return;
			if (!item?.length) {
				toast.error("Must select atleast one member");
				return;
			}
			const res = await axiosInstance.post(
				`/group/${groupID}/add-member`,
				{
					newMembers: item,
				}
			);
			set({ info: res.data });

            toast.success("Successfully added members");
		} catch (error) {
			console.error("Error adding members", error);
			toast.error(error.response?.data?.message);
		}
	},
	removeMember: async (item) => {
		try {
			const groupID = useGlobalStore.getState().selectedGroup?._id;
			if (!groupID) return;
			const res = await axiosInstance.delete(
				`/group/${groupID}/remove-member`,
				{ params: { newMemberID: item._id } }
			);
			if (res.data?.error) {
				toast.error(res.data.message);
				return;
			}
			set({ info: res.data });
			toast.success("Successfully removed member");
		} catch (error) {
			console.error("Error removing member", error);
			toast.error(error.response?.data?.message);
		}
	},
	makeAdmin: async (item) => {
		try {
			const groupID = useGlobalStore.getState().selectedGroup?._id;
			if (!groupID) return;
			const res = await axiosInstance.post(
				`/group/${groupID}/make-admin`,
				{
					newMemberID: item._id,
				}
			);
			if (res.data?.error) {
				toast.error(res.data.message);
				return;
			}
			set({ info: res.data });
            
			toast.success("Successfully made admin");
		} catch (error) {
			console.error("Error making admin", error);
			toast.error(error.response?.data?.message);
		}
	},
	exitGroup: async () => {
		try {
			const groupID = useGlobalStore.getState().selectedGroup?._id;
			if (!groupID) return;
			await axiosInstance.delete(
				`/group/${groupID}/exit-group`
			);

			const { groups, selectedGroup, setGroups, setSelectedGroup } =
				useGlobalStore.getState();
			const newGroups = groups.filter((g) => g !== selectedGroup);
			setGroups(newGroups);
			setSelectedGroup(null);
            
			toast.success("Successfully exited the group");
		} catch (error) {
			console.error("Error exiting group", error);
			toast.error(error.response?.data?.message);
		}
	},
}));
