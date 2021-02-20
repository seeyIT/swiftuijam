const express = require('express');
const https = require('https');
const fs = require('fs');
const csv = require('csv-parser')
var uuid = require('uuid');

const app = express();
const port = process.env.PORT || 3000

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://swiftuijamlogin:PublicPassowrd@cluster0.a5xor.mongodb.net/swiftuijam?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.get('/', function(req, res) {
  res.send('Hello World!!!!' + uuid.v4());

});

app.post('/', function(req, res) {
  res.send('Hello World!');
});


app.get('/slots/:hospital', function(req, res) {
	const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
	console.log("Hospital: " + req.params.hospital);
	client.connect(err => {
		const db = client.db("swiftuijam");
		const collection = db.collection("hospital_slots");
		const data = collection.find({"hospital_name":"Hospital1"}).toArray(function(err, result) {
	   		if (err) throw err;
	    	console.log(result);
	    	client.close();
	    	res.json(result);
		});


	});
});


app.get('/appointments/:id', function(req, res) {
	const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
	console.log("Hospital: " + req.params.hospital);
	client.connect(err => {
		const db = client.db("swiftuijam");
		const collection = db.collection("appointment");
		const data = collection.find({"user_id":req.params.id}).toArray(function(err, result) {
	   		if (err) throw err;
	    	console.log(result);
	    	client.close();
	    	res.json(result);
		});


	});
});

app.post('/bookAppointment', function(req, res) {
	const userId = req.params.userId;
	const hospitalName = req.params.hospitalName;
	const timeSlot = req.params.timeSlot;
	console.log("userId: " + userId);
	console.log("hospitalName: " + hospitalName);
	console.log("timeSlot: " + timeSlot);
	const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

	client.connect(err => {
		const db = client.db("swiftuijam");
		const collection = db.collection("hospital_slots");
		const data = collection.find({"hospital_name":hospitalName}).toArray(function(err, result) {
	   		if (err) throw err;
	    	console.log(result);

	    	const slot = result[0]["slots"][timeSlot];
	    	console.log("slot: " + slot);
	    	if (slot !== "free") {
	    		res.status(400).json({"status":"error"});
	    		client.close();
	    		return;
	    	}

	    	const newUuid = uuid.v4();
	    	const appointment = {
	    		"uuid": newUuid,
	    		"user_id": userId,
	    		"hospita_name": hospitalName,
	    		"time_slot": timeSlot
	    	}
	    	var slots = result[0]["slots"];
	    	slots[timeSlot] = newUuid;
	    	console.table(slots);
	    	collection.updateOne({"hospital_name":hospitalName}, {$set: { slots }});

	    	const appointmentCollection = db.collection("appointment");
	    	appointmentCollection.insertOne(appointment);
	    	

	    	res.status(200).json({"status":"ok","uuid":newUuid});
	    		
	});
});

});

app.get('/bookAppointment/:userId/:hospitalName/:timeSlot', function(req, res) {
	const userId = req.params.userId;
	const hospitalName = req.params.hospitalName;
	const timeSlot = req.params.timeSlot;
	console.log("userId: " + userId);
	console.log("hospitalName: " + hospitalName);
	console.log("timeSlot: " + timeSlot);
	const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

	client.connect(err => {
		const db = client.db("swiftuijam");
		const collection = db.collection("hospital_slots");
		const data = collection.find({"hospital_name":hospitalName}).toArray(function(err, result) {
	   		if (err) throw err;
	    	console.log(result);


	    	const slot = result[0]["slots"][timeSlot];
	    	console.log("slot: " + slot);
	    	if (slot !== "free") {
	    		res.status(400).json({"status":"error"});
	    		client.close();
	    		return;
	    	}

	    	const newUuid = uuid.v4();
	    	const appointment = {
	    		"uuid": newUuid,
	    		"user_id": userId,
	    		"hospita_name": hospitalName,
	    		"time_slot": timeSlot
	    	}
	    	var slots = result[0]["slots"];
	    	slots[timeSlot] = newUuid;
	    	console.table(slots);
	    	collection.updateOne({"hospital_name":hospitalName}, {$set: { slots }});

	    	const appointmentCollection = db.collection("appointment");
	    	appointmentCollection.insertOne(appointment);
	    	

	    	res.status(200).json({"status":"ok","uuid":newUuid});
	    		
	});
});

});

app.get('/clearSlotsData', function(req, res) {
	const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
	client.connect(err => {
		const db = client.db("swiftuijam");
		const collection = db.collection("hospital_slots");
		const data = collection.find({"hospital_name":"Hospital1"}).toArray(function(err, result) {
	   		if (err) throw err;
	    
	    	const slots = {
	    		"900": "free",
	    		"930": "free",
	    		"1000": "free",
	    		"1030": "free",
	    		"1100": "free",
	    		"1130": "free",
	    		"1200": "free",
	    		
	    	}
	    	collection.updateOne({"hospital_name":"Hospital1"}, {$set: { slots }});
	    	res.status(200).json({"status":"ok"});
	    		
	});
});

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


