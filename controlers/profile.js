const register = require('./register')
const handleProfileGet =(req, res, db)=> {
    const { name } = req.params;
    db.select('*').from('users').where({
        name:  register.capitalizeFirstLetter(name)
    })
    .then(user => {
        if(user.length) {
            res.json(user[0])
        } else {
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

const handleRank = (req, res, db) =>{
    const {entries, email} = req.body 
    db('users')
    .where('email', '=', email)
    .update({
        rank: handleRankByEntries(entries)

    })
    .returning("rank")
    .then(rank => {
        res.json(rank)
        })
  }

module.exports = {
    handleProfileGet,
    handleRank
}