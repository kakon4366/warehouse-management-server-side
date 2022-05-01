const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

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

		// get method (all products get)
		app.get("/products", async (req, res) => {
			const query = {};
			const cursor = productCollection.find(query);
			const services = await cursor.toArray();
			res.send(services);
		});

		// get method (all my products get)
		app.get("/myproduct", async (req, res) => {
			const email = req.query.email;

			const query = { email };
			const cursor = productCollection.find(query);
			const services = await cursor.toArray();
			res.send(services);
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
// root server
app.get("/", (req, res) => {
	res.send("Warehouse Management server is running!");
});

app.listen(port, () => {
	console.log(`This Server Running PORT is: ${port}`);
});
