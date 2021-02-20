const express = require('express');
const app = express();
const port = process.env.PORT || 3000

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://swiftuijamlogin:PublicPassowrd@cluster0.a5xor.mongodb.net/swiftuijam?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.get('/', function(req, res) {
  res.send('Hello World!!!!');
});

app.post('/', function(req, res) {
  res.send('Hello World!');
});

app.get('/countrydata', function(req, res) {
	const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
	client.connect(err => {
		const db = client.db("swiftuijam");
		const collection = db.collection("country_data");
		const data = collection.find({}).toArray(function(err, result) {
	   		if (err) throw err;
	    	console.log(result);
	    	client.close();
	    	res.json(result);
		});

	})
});

app.listen(port, function() {
  console.log('Example app listening on port 3000!');
});


