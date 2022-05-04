const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
	const authHeader = req.headers.authorization;
	if (!authHeader) {
		res.status(401).send({ message: "Unauthorized Access!" });
	}

	const token = authHeader.split(" ")[1];

	jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
		if (err) {
			return res.status(403).send({ message: "Forbidden Access!" });
		}
		req.decoded = decoded;
		next();
	});
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fw803.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	serverApi: ServerApiVersion.v1,
});

async function run() {
	try {
		await client.connect();
		const productCollection = client
			.db("warehouseManagementDB")
			.collection("products");

		//AUTH
		app.post("/signin", async (req, res) => {
			const user = req.body;
			const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN, {
				expiresIn: "1d",
			});
			res.send({ accessToken });
		});

		// get method (all products get)
		app.get("/products", async (req, res) => {
			const query = {};
			const cursor = productCollection.find(query);
			const services = await cursor.toArray();
			res.send(services);
		});

		//get Method (Product get by limit)
		app.get("/productsList", async (req, res) => {
			const page = parseInt(req.query.page);
			const limit = parseInt(req.query.limit);
			const query = {};
			const cursor = productCollection.find(query);
			const result = await cursor
				.skip(page * limit)
				.limit(limit)
				.toArray();
			res.send(result);
		});

		// get method (all my products get)
		app.get("/myproduct", verifyJWT, async (req, res) => {
			const decodedEmail = req.decoded.email;
			const email = req.query.email;
			if (email === decodedEmail) {
				const query = { email };
				const cursor = productCollection.find(query);
				const services = await cursor.toArray();
				res.send(services);
			} else {
				res.status(403).send({ message: "Forbidden Access!" });
			}
		});

		// get method (single product get)
		app.get("/inventory/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const product = await productCollection.findOne(query);
			res.send(product);
		});

		// get method (single product get for update)
		app.get("/product/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const product = await productCollection.findOne(query);
			res.send(product);
		});

		//get method (Total product count)
		app.get("/productsCount", async (req, res) => {
			const count = await productCollection.estimatedDocumentCount();
			res.send({ count });
		});

		//put method (update delivered stock)
		app.put("/delivered/:id", async (req, res) => {
			const id = req.params.id;
			const updateProduct = req.body;
			const filter = { _id: ObjectId(id) };
			const options = { upsert: true };
			const updateDoc = {
				$set: {
					stock: updateProduct.stock,
				},
			};
			const result = await productCollection.updateOne(
				filter,
				updateDoc,
				options
			);
			res.send({ success: true, message: "Delivered Success!" });
		});

		//put method (update add stock )
		app.put("/addstock/:id", async (req, res) => {
			const id = req.params.id;
			const updateProduct = req.body;
			const filter = { _id: ObjectId(id) };
			const options = { upsert: true };
			const updateDoc = {
				$set: {
					stock: updateProduct.stock,
				},
			};
			const result = await productCollection.updateOne(
				filter,
				updateDoc,
				options
			);
			res.send({ success: true, message: "Stock Add Success!" });
		});

		//put method (update item)
		app.put("/product/:id", async (req, res) => {
			const id = req.params.id;
			const updateProduct = req.body;
			const filter = { _id: ObjectId(id) };
			const options = { upsert: true };
			const updateDoc = {
				$set: {
					name: updateProduct.name,
					price: updateProduct.price,
					stock: updateProduct.stock,
					suppliername: updateProduct.suppliername,
					img: updateProduct.img,
					quote: updateProduct.quote,
				},
			};
			const updateeProduct = await productCollection.updateOne(
				filter,
				updateDoc,
				options
			);
			res.send({ success: true, message: "Product Update Success!" });
		});

		//post method (new product add)
		app.post("/product", async (req, res) => {
			const product = req.body;
			const result = await productCollection.insertOne(product);
			res.send({ success: true, message: "Product Add Success!" });
		});

		//delete method (Product delete)
		app.delete("/product/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const result = await productCollection.deleteOne(query);
			res.send({ success: true, message: "Product Delete Success!" });
		});
	} finally {
		// await client.close();
	}
}
run().catch(console.dir);

// root server link
app.get("/", (req, res) => {
	res.send("Warehouse Management server is running!");
});

app.listen(port, () => {
	console.log(`This Server Running PORT is: ${port}`);
});
