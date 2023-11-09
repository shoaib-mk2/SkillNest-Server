const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xlwljtp.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const jobsCollection = client.db('jobsDB').collection('jobs');
        const bidsCollection = client.db('jobsDB').collection('bids');

        // post data to the database
        app.post('/jobs', async (req, res) => {
            const newJob = req.body;
            console.log(newJob);
            const result = await jobsCollection.insertOne(newJob);
            res.send(result);
        })

        // get data filtered by email
        app.get('/jobs', async (req, res) => {
            let query = {};
            if (req.query?.jobOwnerEmail) {
                query = { jobOwnerEmail: req.query.jobOwnerEmail }
            }
            const result = await jobsCollection.find(query).toArray();
            res.send(result);
        })

        // get data from database according to id
        app.get('/jobById/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await jobsCollection.findOne(query);
            res.send(result);
        })

        // update a data from the database
        app.put('/jobs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const updatedJob = req.body;

            const job = {
                $set: {
                    jobTitle: updatedJob.jobTitle,
                    deadline: updatedJob.deadline,
                    description: updatedJob.description,
                    category: updatedJob.category,
                    max_price: updatedJob.max_price,
                    min_price: updatedJob.min_price
                }
            }

            const result = await jobsCollection.updateOne(query, job, options)
            res.send(result);
        })

        // delete a data from the database
        app.delete('/jobs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await jobsCollection.deleteOne(query);
            res.send(result);
        })

        // bids related APIs start from here

        // post data to the database
        app.post('/bids', async (req, res) => {
            const newBid = req.body;
            console.log(newBid);
            const result = await bidsCollection.insertOne(newBid);
            res.send(result);
        })

        // get data filtered by email
        app.get('/bids', async (req, res) => {
            let query = {};
            if (req.query?.bidderEmail) {
                query = { bidderEmail: req.query.bidderEmail }
            }
            if (req.query?.jobOwnerEmail) {
                query = { jobOwnerEmail: req.query.jobOwnerEmail }
            }
            const result = await bidsCollection.find(query).toArray();
            res.send(result);
        })

        // update a status for a bid from the database
        app.patch('/bids/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const updatedBid = req.body;
            console.log(updatedBid);

            const updateDoc = {
                $set: {
                    status: updatedBid.status
                }
            }

            const result = await bidsCollection.updateOne(query, updateDoc)
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('SkillNest server is running')
})

app.listen(port, () => {
    console.log(`SKillNest server is running on port: ${port}`);
})