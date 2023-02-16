const Errors = require('../additional/Errors').Errors
const handleServerResponse = require('../additional/handleServerResponse').handleServerResponse
const validatePassword = require('./register').validatePassword
const saltRounds = require('./register').saltRounds


const handleProfileGet =(req, res, db)=> {
    const { username } = req.params;
    db.select('*').from('users').where({
        username:  username
    })
    .then(user => {
        if(user.length == 1) {
            console.log(user)
            res.json(user[0])
        } else if (user.length > 1){
            res.status(200).json(user)
        }
         else {
            res.status(400).json('Not Found')
        }})
    .catch(err => res.status(400).json('Error getting user'))      
    
}


const handleRankByEntries = (entries) => {
    if(entries < 10){
      return('newbie')
    } else if (entries >= 10 && entries < 20){
      return('junior')

    } else if (entries >= 20 && entries < 40){
      return('professor')

    }
     else if (entries >= 40 && entries < 60){
        return('chancellor')

    } else if (entries >= 60 && entries <= 100 ){
        return('vizier')

    } else if (entries > 100){
        return('emperor')
    }
}

const handleRank = (req, res, db, bcrypt) =>{
    const {entries, email} = req.body 
    if(!email|| !entries) return
    db('users')
    .where('email', '=', email)
    .update({
        rank: handleRankByEntries(entries)

    })
    .returning("rank")
    .then(rank => {
        console.log(rank[0])
        res.json(rank[0])
        })
  }

const deleteUser = (req, res, db, bcrypt) => {

    // delete user from login table and from users table
    db.transaction(trx=> {
        const {email, password} = req.body

        return trx.select('hash').from('login').where('email','=', email).then(hash=> {
            if(hash.length == 0) {
                return  res.status(400).json(Errors.NOT_FOUND)
            }
            const isValid = bcrypt.compareSync(password, hash[0].hash);
            if(isValid){
                return trx.select('*').from('login').where('email', '=', email).del()
                .then(()=> {
                    res.status(200).json([`delete-success`, `user registered by ${email} has been deleted`])
                     
                    return trx('users').select('*').from('users').where('email', '=', email).del()
                    
                })
            } else {
                res.status(400).json(Errors.WRONG_PASSWORD)
                
            }
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    
    
}


const changePassword = (req, res, db, bcrypt) =>{
    db.transaction(trx=> {
        const {password, email,username, newPassword} = req.body
        return trx('login').where('email', email).then(user => {
            const isCorrectPassword = bcrypt.compareSync(password, user[0].hash)
            const isValid = validatePassword(newPassword,username )
            console.log(isValid, isCorrectPassword)
            if(isCorrectPassword && isValid == 'valid'){
                const changedPassword = bcrypt.hashSync(newPassword, saltRounds)
                trx('login').where('email', email).update({
                    hash: changedPassword
                    
                })
                .returning('email')
                .then(email=>{
                    console.log(email)
                    console.log(`2: `,email[0].email)
                    res.status(200).json([`success`, `password for ${email[0].email} has been changed`])
                })
                .catch(err=> res.status(400).json('error1'))
            }else if(!isCorrectPassword) {
                res.status(400).json(Errors.WRONG_PASSWORD)
            } else if(isValid !== 'valid'){
                res.status(400).json(isValid)
            }
        })
        .catch(err=> res.status(400).json(Errors.NOT_FOUND))
    })
    
    
}

const changeUserName = (req, res, db, bcrypt) =>{
    
    db.transaction(trx=>{
        const {password, username, email, newUserName} = req.body
        return trx.select("hash").from('login').where("email", email).then(user=>{
            const isCorrectPassword = bcrypt.compareSync(password, user[0].hash)
            if(isCorrectPassword && username !== newUserName ){
                console.log("old: ", username, "new: ", newUserName)
                return trx.select('*').from('users').where({
                    username: username,
                    email: email
                }).update({
                    username: newUserName
                    
                })
                .returning('username')
                .then(newName=>{
                    // Return response error if response doesn't contain anything
                    if(!newName.length) res.status(400).json(Errors.NOT_FOUND)
                    // response if response from database contains username
                    res.status(200).json([`success`, `${username} has been changed to ${newUserName}`])
                })
                .catch(err=>res.status(400).json(handleServerResponse(err)))
            } else if (!isCorrectPassword){
                res.status(400).json(Errors.WRONG_PASSWORD)
            }
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
  
}

const ChangeEmail = (req, res, db, bcrypt) => {
    // change user's email if password is correct
    const emailRegex = /[\w-]+@([\w-]+\.)+[\w-]+/
    db.transaction(trx=>{
        const {password,  email, newEmailInput} = req.body
        if(!password|| !email || !newEmailInput) res.status(400).json(`incorrect form submission`)
        trx.select("hash").from('login').where('email', email)
        .then(user=>{
            const isCorrectPassword = bcrypt.compareSync(password, user[0].hash)
            if(isCorrectPassword && emailRegex.test(newEmailInput) ){
                return trx.select('*').from('users').where("email", email).update({
                    email: newEmailInput
                })
                .returning("email")
                .then(newEmail=> {
                    return trx('login').where("email",email).update({
                        email: newEmail[0].email
                    })
                    .returning('email')
                    .then(newEmail=>{
                        if(newEmail.length === 0) res.status(400).json(Errors.NOT_FOUND)
                        res.status(200).json([`success`,`${email} has been changed to ${newEmail[0].email}`])}
                    )
                })
                .catch(err=> res.status(400).json([`failure`, err]))
                
                

            } else if (!isCorrectPassword){
                res.status(400).json(Errors.WRONG_PASSWORD)
                
            } else if (!emailRegex.test(newEmailInput)){
                res.status(400).json(Errors.INVALID_EMAIL)
            }
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    
}

module.exports = {
    handleProfileGet,
    handleRank,
    deleteUser,
    changePassword,
    changeUserName,
    ChangeEmail
}