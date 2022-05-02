const express = require('express');
const cors = require('cors');
const app = express()
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000

//middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uxezt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const bookCollection = client.db("bookCloset").collection("book");


        //load all books
        app.get('/books', async (req, res) => {
            const query = {}
            const cursor = bookCollection.find(query);
            const allBooks = await cursor.toArray();
            res.send(allBooks);
        })
    }

    finally {

    }
}

run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Book Closet')
})

app.listen(port, () => {
    console.log('Book Closet Connected', port);
})