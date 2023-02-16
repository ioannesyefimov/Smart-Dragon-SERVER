const Errors = require('./Errors').Errors


const handleServerResponse =(response)=>{
    // specific regex to match type of server's response in obj.detail
    const emailExistReg = /^(Key)\s\((email)\)=\([\w-]+@([\w-]+\.)+[\w-]+\)\s(already)\s(exists.)/
    const userNameExistsReg = /^(Key)\s\((username)\)=\(\w+\)\s(already)\s(exists.)/
    

    if(emailExistReg.test(response.detail)){
        return Errors.EMAIL_EXIST
    }
    else if(userNameExistsReg.test(response.detail))
    return Errors.USER_EXIST

}
module.exports ={
    handleServerResponse
}