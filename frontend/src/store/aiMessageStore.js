import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast, { Toaster } from "react-hot-toast";


export const useAiMessageStore = create((set, get) => ({
	messages: [],
    aiThinking : false,
	fetchMessages: async () => {
		
		try {
			const res = await axiosInstance.get(
				`/ai-message/get-ai-messages`
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
		try {
			const formData = new FormData();
			formData.append("image", file);
			formData.append("text", text);
            const res1 = await axiosInstance.post(
                `/ai-message/upload-input`,
                formData
            );
            set({ messages: [...get().messages, res1.data] });
            set({aiThinking:true});
			const res2 = await axiosInstance.post(
				`/ai-message/send-prompt`,
				formData
			);
			set({ messages: [...get().messages, res2.data] });
            set({aiThinking:false})
		} catch (error) {
			console.log("error", error);
		}
	},
    
}));