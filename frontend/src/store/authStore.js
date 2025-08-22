import {create} from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast, { Toaster } from "react-hot-toast";
import { io } from 'socket.io-client';

export const useAuthStore =  create((set,get) => ({
    authUser: null,
    isSigningUp : false,
    isLoggingIn : false,
    isUpdatingProfile : false,
    isCheckingAuth : true,
    isUpdatingprofilePic : false,
    isUpdatingName:false,
    isUpdatingPassword:false,
    socket :null,
    onlineUsers:[],
    setAuthUser: (user)=>{
        set({authUser:user})
    },
    setisUpdatingprofilePic: (currState)=>{
        set({isUpdatingprofilePic:currState})
    },
    setisUpdatingName: (currState)=>{
        set({isUpdatingName:currState})
    },
    setisUpdatingPassword: (currState)=>{
        set({isUpdatingPassword:currState})
    },
    checkAuth : async()=>{
        try {
            const res = await axiosInstance.get("/auth/check");
            set({authUser:res.data});
            get().connectSocket();
        } catch (error) {
            console.log("Error in loading user",error);
            set({ authUser: null });
        }finally{
            set({isCheckingAuth:false});
        }
    },
    signUpUser : async(data)=>{
        try {
            let {email,password,name}= data;
            const res = await axiosInstance.post("/auth/signup",{
                name ,
                email,
                password
            });
            set({authUser:res.data});
            get().connectSocket();
            toast.success("Signed up successfully");
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },
    logInUser : async(data)=>{
        try {
            let {email,password}= data;
            const res = await axiosInstance.post("/auth/login",{
                email,
                password
            });
            set({authUser:res.data});
            get().connectSocket();
            toast.success("Logged in successfully");
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },
    logOutUser: async()=>{
        try {
            const res = await axiosInstance.delete("auth/logout");
            set({authUser:null});
            get().disConnectSocket();
            toast.success("Logged out successfully");
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        }
    },
    changeImage : async(formData)=>{
        try {
            const res = await axiosInstance.post("auth/change/profile-pic", formData);
              set({authUser:res.data});
        } catch (error) {
            console.log(error);
            
        }
    },
    changeName: async(data)=>{
        try {
            let {newName}= data;
            const res = await axiosInstance.post("auth/change/name",{
                newName
            });
            const authUser = res.data;
            useAuthStore.getState().setAuthUser(authUser);
            toast.success("Name changed successfully");
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },
    changePassword: async(data)=>{
        try {
            let {oldPassword,newPassword,confirmPassword}= data;
            const res = await axiosInstance.post("auth/change/password",{
                oldPassword ,
                newPassword ,
                confirmPassword
            });
            const authUser = res.data;
            useAuthStore.getState().setAuthUser(authUser);
            toast.success("Password changed successfully");
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },
    connectSocket : ()=>{
        if (!get().authUser || get().socket?.connected)return;
        
        const socket = io(import.meta.env.VITE_API_URL,{
            query :{
                userId : get().authUser._id,
            },
        })
        socket.connect()
        set({ socket: socket });
        socket.on("onlineUsers",(userIds)=>{
            set({onlineUsers:userIds});
        })
    },
    disConnectSocket : ()=>{
         if(get().socket?.connected) get().socket.disconnect();
         set({ socket: null });
    },
  }))