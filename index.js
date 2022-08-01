const express = require('express');
const cors = require('cors');
const app = express()
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000

//middleware
app.use(cors());
app.use(express.json());


function verifyJwt(req, res, next) {
    const autheader = req.headers.authorization
    if (!autheader) {
        return res.status(401).send({ message: 'Unauthoried access' })
    }
    const userToken = autheader.split(' ')[1];
    jwt.verify(userToken, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden Access' })
        }
        req.decoded = decoded;
        next()
    })
}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uxezt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const bookCollection = client.db("bookCloset").collection("book");
        const upcomingCollection = client.db("bookCloset").collection("upcoming");

        //Jwt
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = await jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '2d' });
            res.send({ accessToken })
        })

        //load all books
        app.get('/books', async (req, res) => {
            const page = Number(req.query.page);
            const size = Number(req.query.size);
            const query = {}
            const cursor = bookCollection.find(query);
            let allBooks;
            if (page || size) {
                allBooks = await cursor.skip(size * page).limit(size).toArray()
            }
            else {

                allBooks = await cursor.toArray();
            }
            res.send(allBooks);
        })

        //load single book with id
        app.get('/book/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const oneBook = await bookCollection.findOne(query)
            res.send(oneBook)
        })

        app.get('/mybook', verifyJwt, async (req, res) => {
            const email = req.query.email;
            const decoedEmail = req.decoded.email;

            if (email === decoedEmail) {
                const query = { email: email };
                const cursor = bookCollection.find(query);
                const mybooks = await cursor.toArray();
                res.send(mybooks)
            }
            else {
                return res.status(403).send({ message: 'Forbiden Access' })
            }
        })

        //pagination
        app.get('/pagination', async (req, res) => {
            const count = await bookCollection.countDocuments();
            res.send({ count });
        })

        //update quantity
        app.put('/book/:id', async (req, res) => {
            const id = req.params.id;
            const prevQuantity = req.body.updateQuantity
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateBook = {
                $set: { quantity: prevQuantity }

            }
            const book = await bookCollection.updateOne(filter, updateBook, options)
            res.send(book)
        })

        //add book api
        app.post('/books', async (req, res) => {
            const newBook = req.body;
            const addBook = await bookCollection.insertOne(newBook);
            res.send(addBook)
        })

        //delete item api
        app.delete('/book/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }

            const deleteBook = await bookCollection.deleteOne(query);
            res.send(deleteBook);
        })


        //upcoming api
        app.get('/upcoming', async (req, res) => {
            const query = {}
            const cursor = upcomingCollection.find(query);
            const upcomingBooks = await cursor.toArray();
            res.send(upcomingBooks);
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