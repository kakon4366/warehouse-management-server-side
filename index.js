const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
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

		app.get("/products", async (req, res) => {
			const query = {};
			const cursor = productCollection.find(query);
			const services = await cursor.toArray();
			res.send(services);
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
