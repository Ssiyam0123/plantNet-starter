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
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5176",
  ],
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

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
    const ordersCollections = client.db("plantNet").collection("orderDb");
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
      console.log(email);
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

    //inventory delete api
    app.delete("/delete/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await plantsCollections.deleteOne(query);
      res.send(result);
    });

    //api for user info
    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await userCollections.find(query).toArray();
      res.send(result);
    });

    //save order data
    app.post("/orderPurchase", async (req, res) => {
      const data = req.body;
      const result = await ordersCollections.insertOne(data);
      res.send(result);
    });

    //manage plant quantity
    app.patch("/plants/quantity/:id", async (req, res) => {
      const id = req.params.id;
      const { quantityToUpdate, status } = req.body;
      const query = { _id: new ObjectId(id) };
      let update = {
        $inc: { quantity: -quantityToUpdate },
      };
      if (status === "increase") {
        update = {
          $inc: {
            quantity: quantityToUpdate,
          },
        };
      }
      const result = await plantsCollections.findOneAndUpdate(query, update);
      console.log(result);
      res.send(result);
    });

    //get my order
    app.get("/myorders/:email", async (req, res) => {
      const email = req.params.email;
      const query = { "customer.email": email };
      const result = await ordersCollections
        .aggregate([
          {
            $match: query,
          },
          {
            $addFields: {
              plantId: {
                $toObjectId: "$plantId",
              },
            },
          },
          {
            $lookup: {
              from: "plantsDb",
              localField: "plantId",
              foreignField: "_id",
              as: "plants",
            },
          },
          {
            $unwind: "$plants",
          },
          {
            $addFields: {
              name: "$plants.name",
              image: "$plants.image",
              category: "$plants.category",
            },
          },
          {
            $project: {
              plants: 0,
            },
          },
        ])
        .toArray();
      res.send(result);
    });

    //cancel order api
    app.delete("/cancelorder/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await ordersCollections.deleteOne(query);
      res.send(result);
    });

    //update inventory
    app.put("/update/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      // console.log(id)
      // console.log(data)
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          name: data.name,
          category: data.category,
          description: data.description,
          image: data.image,
          price: data.price,
          quantity: data.quantity,
        },
      };
      // console.log(updateDoc)
      const result = await plantsCollections.updateOne(query, updateDoc);
      res.send(result);
    });

    //manage user status and role

    app.patch("/user/:email", async (req, res) => {
      const email = req.params.email;
      const { status } = req.body;
      const query = { email };
      const user = await userCollections.findOne(query);
      if (!user || user?.status === "requested")
        return res.status(400).send("you have already requested");

      const updateDoc = {
        $set: {
          status: "request",
        },
      };

      const result = await userCollections.updateOne(query, updateDoc);
      res.send(result);
    });

    //get user role
    app.get("/user/role/:email", async (req, res) => {
      const email = req.params.email;
      const result = await userCollections.findOne({ email });
      res.send({ role: result?.role });
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
