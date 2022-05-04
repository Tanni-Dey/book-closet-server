const express = require('express');
const cors = require('cors');
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

        //load single book with id
        app.get('/book/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const query = { _id: ObjectId(id) };
            const oneBook = await bookCollection.findOne(query)
            res.send(oneBook)
        })

        //update quantity
        app.put('/book/:id', async (req, res) => {
            const id = req.params.id;
            const prevQuantity = req.body.updateQuantity
            console.log(req.body)
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateBook = {
                $set: { quantity: prevQuantity }

            }
            const book = await bookCollection.updateOne(filter, updateBook, options)
            res.send(book)
        })
        //update quantity
        // app.put('/book/:id', async (req, res) => {
        //     const id = req.params.id;
        //     // const prevQuantity = req.body.quantity;
        //     const prevboook = req.body;
        //     const filter = { _id: ObjectId(id) };
        //     const options = { upsert: true };
        //     const updateBook = {
        //         $set: { prevboook }
        //     }
        //     const book = await bookCollection.updateOne(filter, updateBook, options)
        //     res.send(book)
        // })

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