require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const morgan = require("morgan");

const port = process.env.PORT || 9000;
const app = express();
// middleware
// const corsOptions = {
//   origin: ['http://localhost:5173', 'http://localhost:5174','http://localhost:5176'],
//   credentials: true,
//   optionSuccessStatus: 200,
// }
app.use(cors());

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

const verifyToken = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log(err);
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.user = decoded;
    next();
  });
};

const uri = process.env.MONGO_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    //db connnection
    const userCollections = client.db("plantNet").collection("userDb");
    const plantsCollections = client.db("plantNet").collection("plantsDb");

    // Generate jwt token
    app.post("/jwt", async (req, res) => {
      const email = req.body;
      console.log(email);
      const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "365d",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    });
    // Logout
    app.get("/logout", async (req, res) => {
      try {
        res
          .clearCookie("token", {
            maxAge: 0,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
          })
          .send({ success: true });
      } catch (err) {
        res.status(500).send(err);
      }
    });

    //user route
    app.post("/user/:email", async (req, res) => {
      const email = req.params;
      // console.log(email)
      const user = req.body;
      // console.log("before affended user role:",user)
      const query = await userCollections.findOne(email);
      if (!query) {
        const userData = {
          ...user,
          role: "Customer",
        };
        console.log("after affended user role:", userData);
        const result = await userCollections.insertOne(userData);
        res.send(result);
        // console.log(result)
      }
      // console.log(query)
      res.send(query);
    });

    //post pant to databse
    app.post("/add-plant", async (req, res) => {
      const data = req.body;
      console.log(data);
      const result = await plantsCollections.insertOne(data);
      res.send(result);
    });

    //get plant route
    app.get("/plants", async (req, res) => {
      const result = await plantsCollections.find().toArray();
      // console.log('here is get data',result)
      res.send(result);
    });

    //for single plant api
    app.get("/details/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await plantsCollections.findOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello from plantNet Server..");
});

app.listen(port, () => {
  console.log(`plantNet is running on port ${port}`);
});
