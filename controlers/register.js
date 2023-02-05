
const saltRounds = 10
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

const handleRegister = (req, res, db, bcrypt) => {
    const { email, name, password} = req.body;

    const hash = bcrypt.hashSync(password, saltRounds);
    if(!email || !name || !password ){
        return res.status(400).json('incorrect form submission')
    }
        db.transaction(trx=> {
        trx.insert({
            hash: hash,
            email: email
        })
        .into('login')
        .returning('email')
        .then(loginEmail => {
            return  trx('users')
                .returning('*')
                .insert({
                    email: loginEmail[0].email,
                    name: capitalizeFirstLetter(name),
                    joined: new Date(),
                    rank: 'newbie'
                })
                .then(user => {
                    res.json(user[0])
                })
            })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err => res.status(400).json('unable to register'))
    
}

module.exports = {
    handleRegister: handleRegister,
    capitalizeFirstLetter: capitalizeFirstLetter,
}