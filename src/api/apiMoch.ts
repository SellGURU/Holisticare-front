/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { resolveBaseEndPoint } from "./base";

const mock = new MockAdapter(axios,{ delayResponse: 2000 })

class Api {
  protected static base_url: string =resolveBaseEndPoint();
  
  public static post(url:string,reply:any,status?:number,body?:any) {
    const useStatus = status || 200
    const response = mock.onPost(this.base_url+url,body).reply(useStatus,reply)    
    return response
  }

  public static get(url:string,reply:any,status?:number){
    const useStatus = status || 200
    const response = mock.onGet(this.base_url+url).reply(useStatus,reply)    
    return response
  }
}

export default Api;