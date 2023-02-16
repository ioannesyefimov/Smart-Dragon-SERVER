 const Errors = {
    INVALID_PASSWORD: `Password must be in English and contains at least one uppercase and lowercase character, one number, and one special character`,
    PASSWORD_CONTAINS_NAME: `PASSWORD_MUST_NOT_CONTAIN_USER'S_INPUT`,
    USER_EXIST: 'USER_ALREADY_EXISTS',
    EMAIL_EXIST: 'EMAIL_ALREADY_EXISTS',
    NOT_FOUND: 'NOT_FOUND',
    WRONG_PASSWORD: `WRONG_PASSWORD`,
    INVALID_EMAIL: `INVALID_EMAIL`,
    WRONG_EMAIL: `WRONG_EMAIL`
    
}

module.exports = {
    Errors
}