export {}; // Ensures this file is treated as a module

declare global {
  type PackageTypes = 'Free' | 'Pro' | 'Plus';

  type checkinType = {
    order?:number
    question:string
    type:string
    required:boolean
    response:string
    options?:Array<string>
  }

  type CheckinFormType = {
    title:string
    questions:Array<checkinType>
  }

  type CheckInDataRowType = {
    title:string
    questions:number
    created_on:string
    created_by:string
  }
}

