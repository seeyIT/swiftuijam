const express = require('express');
const https = require('https');
const fs = require('fs');
const csv = require('csv-parser')

const app = express();
const port = process.env.PORT || 3000

// const MongoClient = require('mongodb').MongoClient;
// const uri = "mongodb+srv://swiftuijamlogin:PublicPassowrd@cluster0.a5xor.mongodb.net/swiftuijam?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.get('/', function(req, res) {
  res.send('Hello World!!!!');
});

app.post('/', function(req, res) {
  res.send('Hello World!');
});


app.get('/newestData/:country', function(req, res) {
	const results = [];
	const file = fs.createWriteStream("data/"+req.params.country+".csv");
		https.get("https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/vaccinations/country_data/"+req.params.country+".csv", function(response) {
		response.pipe(file);
		fs.createReadStream("data/" + req.params.country+".csv")
			.pipe(csv())
			.on('data', (data) => results.push(data))
			.on('end', () => {
			res.json(results[results.length-1]);
		});
	});
});

app.get('/allData/:country', function(req, res) {
	const results = [];
	const file = fs.createWriteStream("data/"+req.params.country+".csv");
	https.get("https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/vaccinations/country_data/"+req.params.country+".csv", function(response) {
		response.pipe(file);
		fs.createReadStream("data/" + req.params.country+".csv")
			.pipe(csv())
			.on('data', (data) => results.push(data))
			.on('end', () => {
			res.json(results);
		});
	});
});

app.get('/countrydata/:country', function(req, res) {
	const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
	console.log(req.params);

	client.connect(err => {
		const db = client.db("swiftuijam");
		const collection = db.collection("country_data");
		const data = collection.find({"location": req.params.country}).toArray(function(err, result) {
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


