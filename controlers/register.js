
const saltRounds = 10
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const passwordErrors = {
    INVALID: `password is not valid`,
    CONTAINS_NAME: `password must not contain users input`
    
}

function validatePassword(password,name) {
    // check whether password doesn't contains at least 
    // 1 uppercase, 1 lowercase, 1 number, and 1 special character. 
    // If it doesn't contains everything mentioned, returns true
    const password_rgx = /^(.{0,7}|[^0-9]*|[^A-Z]*|[^a-z]*|[a-zA-Z0-9]*)$/

    function kmpSearch(pattern, text) {
        if (pattern.length == 0)
          return 0; // Immediate match
      
        // Compute longest suffix-prefix table
        let lsp = [0]; // Base case
        for (let i = 1; i < pattern.length; i++) {
          let j = lsp[i - 1]; // Start by assuming we're extending the previous LSP
          while (j > 0 && pattern[i] !== pattern[j])
            j = lsp[j - 1];
          if (pattern[i] === pattern[j])
            j++;
          lsp.push(j);
        }
      
        // Walk through text string
        let j = 0; // Number of chars matched in pattern
        for (let i = 0; i < text.length; i++) {
          while (j > 0 && text[i] != pattern[j])
            j = lsp[j - 1]; // Fall back in the pattern
          if (text[i]  == pattern[j]) {
            j++; // Next char matched, increment position
            if (j == pattern.length)
              return i - (j - 1);
          }
        }
        return -1; // Not found
      }
    
      const hasNamePatternInPassword = kmpSearch(name, password)

      const isValidPassword = password_rgx.test(password)
    
    if((hasNamePatternInPassword != -1) ){
        return passwordErrors.CONTAINS_NAME
    } else if(isValidPassword === true) {
        return passwordErrors.INVALID
    }
    
}


const handleRegister = (req, res, db, bcrypt) => {
    const { email, name, password} = req.body;


    const hash = bcrypt.hashSync(password, saltRounds);
    if((!email || !name || !password )){
        return res.status(400).json('incorrect form submission')
    } else if (validatePassword(password, name) == passwordErrors.INVALID){
        return res.status(400).json('Password must be in English and contains at least one uppercase and lowercase character, one number, and one special character')
    } else if(validatePassword(password, name) == passwordErrors.CONTAINS_NAME){
        return res.status(400).json(JSON.stringify(passwordErrors.CONTAINS_NAME))

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
                    username: capitalizeFirstLetter(name),
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