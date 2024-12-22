import axios from "axios";
import { toast } from "react-toastify";

axios.interceptors.response.use((response) => {
    if(response.status === 200) {
         toast.dismiss()
    }
    if(response.data.detail){
        if (response.data.detail && response.data.detail.toLowerCase().includes("successfully")) {
            toast.success(response.data.detail)
        }else {
            toast.error(response.data.detail) 
        }
    }
    if(response.status ==401 || response.data.detail =='Invalid token.'){
        localStorage.clear()
        window.location.reload(); 
    }    
    if(response.data.detail &&response.data.notif!=true &&response.data.detail !='Invalid token.'  && response.data.detail !='Not Found'){
        toast.error(response.data.detail)
    }
    if ( response.data && response.data.detail) {
      // Handle the custom error provided in the response body
      return Promise.reject(new Error(response.data.detail)); // Reject the promise to trigger the catch block
    }    
    return response;
}, (error) => {
    if (error.response) {
        const { status, data } = error.response;
  
        // Handle 400 error specifically
        if (status === 400 && data.detail) {
          toast.error(data.detail);
        }
    }
    if(error.response.status ==401 || error.response.data.detail =='Invalid token.'){
        localStorage.clear()
        window.location.reload(); 
    }     
    if(error.response.data.detail){
        if (error.response.data.detail && error.response.data.detail.toLowerCase().includes("successfully")) {
            toast.success(error.response.data.detail)
        }else {
            toast.error(error.response.data.detail) 
        }
    }     
    // console.log(error.response.data.detail)
    if(error.response.data.detail && error.response.data.detail !='Invalid token.'  && error.response.data.detail !='Not Found'){
        toast.error(error.response.data.detail)
    }
    if (error.response && error.response.data) {
        return Promise.reject(error.response.data);
    }
    return Promise.reject(error.message);
});