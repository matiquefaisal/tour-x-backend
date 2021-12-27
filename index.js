const express = require('express')
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId
const cors = require('cors')
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000

// MIDDLEWARE
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wanl6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("tourism");
        const offerPackagesCollection = database.collection("offer_Packages");
        const bookingsCollection = database.collection("bookings");

        // Find all document 
        app.get('/packages', async (req, res) => {
            console.log('hitting the get');
            const cursor = offerPackagesCollection.find({});
            const result = await cursor.toArray();
            res.send(result)
            // console.log(result);

        })

        // ADD BOOKINGS
        app.post('/packages/bookings/', async (req, res) => {
            const userData = req.body
            const result = await bookingsCollection.insertOne(userData)
            res.json(result)
        })

        // CHECK USER ORDERS
        app.post('/my-bookings/userEmail', async (req, res) => {

            const user = req.body
            const email = user.email
            const query = { userEmail: { $in: user } }
            const result = await bookingsCollection.find(query).toArray()
            res.json(result)
        })

        // CHECK ALL ORDERS
        app.get('/all-bookings', async (req, res) => {
            const cursor = bookingsCollection.find({})
            const result = await cursor.toArray()
            res.json(result)
        })

        // DELETE BOOKING
        app.delete('/bookings/:deleteId', async (req, res) => {
            const orderId = req.params.deleteId
            const query = { _id: ObjectId(orderId) }
            const result = await bookingsCollection.deleteOne(query)
            res.json(result)

        })

        //  UPDATE BOOKING STATUS
        app.put('/bookings/manage-all-bookings/:id', async (req, res) => {
            const id = req.params.id
            const updateStatus = req.body
            const filter = { _id: ObjectId(id) };

            const updateDoc = {
                $set: {
                    status: updateStatus.status
                }
            }
            const result = await bookingsCollection.updateOne(filter, updateDoc)
            res.json(result)
            console.log('Updating user', updateStatus);
        })

        // ADD NEW PACKAGE
        app.post('/add-new-package', async (req, res) => {
            const packageDetails = req.body
            const result = await offerPackagesCollection.insertOne(packageDetails);
            console.log('hitting add new package', result);
            res.json(result)
        })


    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World! Heroku is working fine')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})