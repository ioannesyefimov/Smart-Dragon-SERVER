
const handleProfileGet =(req, res, db)=> {
    const { name } = req.params;
    db.select('*').from('users').where({
        name: name
    })
    .then(user => {
        if(user.length) {
            res.json(user[0])
        } else {
            res.status(400).json('Not Found')
        }})
    .catch(err => res.status(400).json('Error getting user'))      
    
}

module.exports = {
    handleProfileGet
}