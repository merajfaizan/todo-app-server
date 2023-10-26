require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middlewares
app.use(express.json());
app.use(cors());

// mongodb connection string
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.k5v5ibx.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// api end points
async function run() {
  try {
    // await client.connect();
    // console.log("You successfully connected to MongoDB!");

    // database and collections
    const db = client.db("TodoApp");
    const todosCollection = db.collection("todos");
    const usersCollection = db.collection("users");

    // post endpoint for insert a user
    app.post("/users", async (req, res) => {
      const data = req.body;
      if (!data) {
        res.status(400).send({
          message: "Please provide user data",
        });
      }
      try {
        const result = await usersCollection.insertOne(data);
        if (result.acknowledged) {
          res.status(201).send({
            message: "Registered successfully",
            data: result.insertedId,
          });
        }
      } catch (error) {
        res.status(500).send({
          message:
            "there is an error on internal server, registration unsuccessful.",
        });
      }
    });

    // put endpoint for insert a todo in user todos array.
    app.put("/todo", async (req, res) => {
      const { uid, todo } = req.body;
      if (!uid || !todo) {
        res.status(400).send({
          message: "Please provide uid and todo",
        });
      }
      const filter = { uid: uid };
      const update = { $push: { todos: { todo } } };
      console.log(filter, update);

      try {
        const result = await usersCollection.updateOne(filter, update);
        if (result.acknowledged) {
          res.status(201).send({
            message: "Item added successfully",
            data: result.insertedId,
          });
        }
      } catch (error) {
        res.status(500).send({
          message: "there is an error on internal server, item not added.",
        });
      }
    });

    // get endpoint for get all the todos.
    app.get("/todos", async (req, res) => {
      try {
        const result = await todosCollection.find({}).toArray();
        res.status(200).send(result);
      } catch (error) {
        res.status(500).send({
          message: "there is an error on internal server.",
        });
      }
    });

    // delete endpoint for delete a todo.
    app.delete("/todos/:id", async (req, res) => {
      const id = req.params.id;
      if (!id) {
        res.status(400).send({
          message: "Please provide id",
        });
      }
      try {
        const result = await todosCollection.deleteOne({
          _id: new ObjectId(id),
        });
        if (result.deletedCount === 1) {
          res.status(200).send({
            message: "Item deleted successfully",
          });
        }
      } catch (error) {
        res.status(500).send({
          message: "there is an error on internal server, item not deleted.",
        });
      }
    });

    // get endpoint for get a todo.
    app.get("/todos/:id", async (req, res) => {
      const id = req.params.id;
      if (!id) {
        res.status(400).send({
          message: "Please provide id",
        });
      }
      try {
        const result = await todosCollection.findOne({
          _id: new ObjectId(id),
        });
        res.status(200).send(result);
      } catch (error) {
        res.status(500).send({
          message: "there is an error on internal server.",
        });
      }
    });

    // put endpoint for update a todo.
    app.put("/todos/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      if (!id || !data) {
        res.status(400).send({
          message: "Please provide id and data",
        });
      }
      try {
        const result = await todosCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: data }
        );
        if (result.matchedCount === 1) {
          res.status(200).send({
            message: "Item updated successfully",
          });
        }
      } catch (error) {
        res.status(500).send({
          message: "there is an error on internal server, item not updated.",
        });
      }
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// initial route
app.get("/", (req, res) => {
  res.send("Todo App is Running...");
});

app.listen(port, () => {
  console.log(`Todo server running on port: ${port}`);
});
