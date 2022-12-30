const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
const app = express();
//middleware
app.use(cors());
app.use(express.json());

const url = `mongodb+srv://server11:server11@cluster0.czo9kw9.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(url);

async function run() {
    try {
        const taskCollection = client.db('taskCollection').collection('allTask');
        //for all task
        app.post('/tasks', async (req, res) => {
            try {
                const result = await taskCollection.insertOne(req.body);
                if (result.insertedId) {
                    res.send({
                        success: true,
                        message: `successfully added ${req.body.name}`
                    })
                }
                else {
                    res.send({
                        success: false,
                        error: `could not add the product`
                    })
                }
            } catch (err) {
                res.send({
                    success: false,
                    error: err.message,
                })
            }
        });
        app.get('/my-task', async (req, res) => {
            let query = {};
            if (req.query.email) {
                query = {
                    userMail: req.query.email
                }
            }
            const cursor = taskCollection.find(query);
            const tasks = await cursor.toArray();
            res.send(tasks)
        });
        app.get('/edit/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const cursor = taskCollection.find(query);
            const tasks = await cursor.toArray();
            res.send(tasks)
        })
        app.put('/task/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const task = req.body;
            const option = { upsert: true };
            const updatedTask = {
                $set: {
                    task: task.task,
                    date: task.date,
                    details: task.details,
                }
            }
            const result = await taskCollection.updateOne(filter, updatedTask, option);
            res.send(result)
        })
        app.delete('/my-task/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await taskCollection.deleteOne(query);
            res.send(result);
        })
        app.get('/', async (req, res) => {
            res.send('tanvir task is running')
        })
        app.put('/completed/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const filter = { _id: ObjectId(id) };
                const option = { upsert: true };
                const completeTask = { $set: req.body }
                const result = await taskCollection.updateOne(filter, completeTask, option);
                res.send(result)
            } catch (error) {
                console.log(error.message);
            }
        })

    }
    catch (err) {
        console.log(err.message);
    }
}

run();

app.listen(port, () => console.log('server is running', port))