const { response } = require('express')
const express = require('express')
const bcrypt = require('bcrypt')
const cors = require('cors')
const knex = require('knex')

const register = require('./controlers/register')
const signIn = require('./controlers/signIn')
const profile = require('./controlers/profile')
const image = require('./controlers/image')

const db = knex({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        user: 'postgres',
        password: 'ioannes',
        database: 'smart-dragon'
    }
});




const app = express()

app.use(express.json())
app.use(cors())

app.get('/', (req, res)=>{
    res.status(200).json('Success')
})

app.post('/signin',(req, res) => {signIn.handleSignIn(req, res, db, bcrypt)})

app.post('/register', (req, res) => { register.handleRegister(req, res, db, bcrypt) })
app.post('/imageurl', (req, res) => {image.handleApiCall(req, res)})
        

app.get('/profile/:id', (req, res) => { profile.handleProfileGet(req, res,db)})

app.put('/image', (req,res) => {image.handleImage(req,res, db)});

app.listen(3000, ()=>{
    console.log('app is running on port 3000')
})
