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
            const isValid = bcrypt.compareSync(password, hash[0].hash);
            if(isValid){
                return trx.select('*').from('login').where('email', '=', email).del()
                .then(()=> {
                    return trx('users').select('*').from('users').where('email', '=', email).del()
                })
            } else {
                res.status(400).json('unable to delete')
            }
        })
        
    })
    .then(()=> {
        res.status(200).json(`user have been deleted`)
    })
    .catch(err=> {
        res.status(400).json(`something went wrong`)
        console.error(err)
    })
      
    
 
   
    
}

module.exports = {
    handleProfileGet,
    handleRank,
    deleteUser,
}