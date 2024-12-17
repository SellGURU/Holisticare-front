/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
// import { getTokenFromLocalStorage } from "@/store/token";
import { toast } from "react-toastify";
// http://51.142.20.137:5052
class Api {
  protected static base_url: string = "https://vercel-backend-one-roan.vercel.app/holisticare";
  // protected static base_url: string = "https://mock.app";
  protected static post(url: string, data?: any,config?:any) {
    if(!config?.noPending ){
      toast.clearWaitingQueue()
      // toast.loading('pending ...')
    }
    const response = axios.post(this.base_url + url, data, {
      headers: {
        // Authorization: "Bearer " + getTokenFromLocalStorage(),
        "Content-Type": config?.headers?.['Content-Type'] || "application/json",
      },
      // timeout:15000
    });
    return response;
  }

  protected static get(url:string , config?:any) {
    // toast.loading('pending ...')
    const response = axios.get(this.base_url+url , { headers: {
      // Authorization: "Bearer " + getTokenFromLocalStorage(),
      "Content-Type": config?.headers?.['Content-Type'] || "application/json",
    },});
    return response;    
  }

  protected static getCheck(value:string) {
    const response = axios.get(value,{
      method:'GET',
      headers:{
        Accept: 'video/mp4;charset=UTF-8',
        responseType: 'blob',
        "Access-Control-Allow-Headers":"*",
        "Access-Control-Allow-Origin":"*"
      },
      
    });
    return response;        
  }
}

export default Api;