const resolveStatusArray = (status:Array<number>) =>{
    if (status.length === 0) return 'Need action'
    // switch(status.indexOf(Math.max(...status))){
    //     case 0 :return 'Normal'
    //     case 1 : return 'Normal'
    //     case 2 : return 'At risk'
    //     case 3 : return 'Need action'
    //     default : 'Need action'
    // }
    if(status[3] > 0){
        return 'Need action'
    }
    if(status[2] > 0){
        return 'At risk'
    }    
    if(status[1] > 0){
        return 'Normal'
    }
    return 'Excelent'

}

export default resolveStatusArray