const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
const bodeParser = require('body-parser');
require('dotenv').config()

const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3fo4t.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

app.use(express.json());
app.use(cors());
app.use(bodeParser.json());

app.get('/', (req, res) => {
    res.send("Hello from db it's working")
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const blogsCollection = client.db("CreativeBlogs").collection("blogs");
    const adminsCollection = client.db("CreativeBlogs").collection("admins");

    app.get('/blogs', (req, res) => {
        blogsCollection.find({})
            .toArray((err, items) => {
                res.send(items)
            })
    })

    app.post('/addBlog', (req, res) => {
        const blog = req.body;
        blogsCollection.insertOne(blog)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    });

    app.get('/blog/:id', (req, res) => {
        blogsCollection.find({ _id: ObjectId(req.params.id) })
            .toArray((err, items) => {
                res.send(items[0])
            })
    })

    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        const password = req.body.password
        adminsCollection.find({ email: email, password: password})
            .toArray((er, admins) => {
                res.send(admins.length > 0);
            })
    })

    app.delete('/deleteBlog/:id', (req, res) => {
        const id = ObjectId(req.params.id);
        blogsCollection.findOneAndDelete({_id: id})
        .then(documents => res.send(!!documents.value))
      })

});

app.listen(process.env.PORT || port)