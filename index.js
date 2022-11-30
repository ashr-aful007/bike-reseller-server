const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000;

//midleware 
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster1.bsfuvd2.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next){
    
    const authHeader = req.headers.authorization;
    console.log('insid jwt',req.headers.authorization);
    if(!authHeader){
        return res.status(401).send('unauthorized access')
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, function(err, decoded){
        if(err){
             return res.status(403).send({message: 'forbidden access'})
        }
        req.decoded = decoded
        next();
    })
    
}
 
function run(){
  try{
    const productsCollection = client.db('bikeresell').collection('productscatagory')
    const catagorydata = client.db('bikeresell').collection('catagory')
    const bookingdataCollection = client.db('bikeresell').collection('bookingdata')
    const usersCollection = client.db('bikeresell').collection('allUsers')
     

    //get catagory
    app.get('/catagoty', async(req,res) =>{
         const query = {}
         const cursor =  catagorydata.find(query)
         const catagory = await cursor.toArray()
         res.send(catagory)
    })


    //dynamic catagory data
    app.get('/productscatagory/:id',async(req,res) =>{
      const id = req.params.id
       const query = {catagoryId: id}
       const cursor = productsCollection.find(query)
       const products = await cursor.toArray()
       res.send(products)
    })

    //email query for my orders
    app.get('/booking', verifyJWT, async(req, res) =>{      
        const email = req.query.email;
        const decodedEmail = req.decoded.email;
        console.log(email,decodedEmail )
        if(email !== decodedEmail){
             return res.status(403).send({message: 'forbidden access'});
        }
        const query = {email: email}
        const bookign = await bookingdataCollection.find(query).toArray()
        res.send(bookign)
    })

    //My products route
    app.get('/addProducts',verifyJWT, async(req, res) =>{
        const email = req.query.email;
        const decodedEmail = req.decoded.email;
        console.log(email, decodedEmail)
        if(email !== decodedEmail){
             return res.status(403).send({message: 'forbidden access'});
        }
        const query = {sellerEmail: email}
        const addProducts = await productsCollection.find(query).toArray()
        res.send(addProducts)
    })



    //boking post api
    app.post('/booking', async(req, res) =>{
        const bookingInfo = req.body;
        const result = await bookingdataCollection.insertOne(bookingInfo)
        res.send(result)
    })

    //post addProducts
    app.post('/addProducts', async(req, res) =>{
       const addProducts = req.body;
       const result = await productsCollection.insertOne(addProducts)
       res.send(result)
    })

    //Create userCollection
    app.post('/user', async(req,res) =>{
        const user = req.body;
        const result = await usersCollection.insertOne(user)
        res.send(result)
    })

    //jwt 
    app.get('/jwt', async(req,res) =>{
       const email = req.query.email;
       const query = {email: email}
       const user = await usersCollection.findOne(query)
       if(user){
          const token = jwt.sign({email}, process.env.ACCESS_TOKEN, {expiresIn: '7d'})
          return res.send({accesstoken: token})
       }
       res.status(403).send({accesstoken:''})

      })

      //get all users to email
      app.get('/users', async(req, res) =>{
          const role = req.query.role
          const query = {role: role};
          const users = await usersCollection.find(query).toArray()
          res.send(users)
      })

      //user vrify option route
      app.put('/users/vrify/:id', async(req, res) =>{
          const id = req.params.id;
          const filter = {_id: ObjectId(id)}
          const options = {upsert: true}
          const updateDoc ={
             $set:{
                 isVrifyed: 'true'
             }
          }
          const result = await usersCollection.updateOne(filter, updateDoc, options)
          res.send(result);
      })

  }
  finally{

  }
}
run()


app.get('/', async(req, res) =>{
     res.send('bike resell running')
})


app.listen(port, () => `bike resell running on ${port}`)
