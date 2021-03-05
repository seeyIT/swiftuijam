const express = require('express');
const https = require('https');
const fs = require('fs');
const csv = require('csv-parser')
const uuid = require('uuid');

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", '*');
    res.header("Access-Control-Allow-Credentials", true);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
    next();
});
const port = process.env.PORT || 3000

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://swiftuijamlogin:PublicPassowrd@cluster0.a5xor.mongodb.net/swiftuijam?retryWrites=true&w=majority";

app.get('/', function(req, res) {
	res.send('Welcome! It is the best SwiftUI Jam API :)');
});

/*
*
* Part related to handle registration to be vaccinated
*
*/

// Endpoint returns all slots for needed hospital
// Params:
// - hospitalName: String
app.get('/slots/:hospitalName', function(req, res) {
	if (req.params.hospitalName == null) {
		res.status(400).json({"message":"hispital name is missing"});
		return;
	}
	const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
	client.connect(err => {
		const db = client.db("swiftuijam");
		const collection = db.collection("hospital_slots");
		const data = collection.find({"hospital_name":req.params.hospitalName}).toArray(function(err, result) {
	   		if (err) throw err;
	    	console.log(result);
	    	client.close();
	    	res.json(result);
		});


	});
});

// Endpoint returns appointments for user ID
// Params:
// - userId: String
app.get('/appointments/:userId', function(req, res) {
	if (req.params.userId == null) {
		res.status(400).json({"message":"user id is missing"});
		return;
	}
	const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
	client.connect(err => {
		const db = client.db("swiftuijam");
		const collection = db.collection("appointment");
		const data = collection.find({"user_id":req.params.userId}).toArray(function(err, result) {
	   		if (err) throw err;
	    	client.close();
	    	res.json(result);
		});


	});
});

// Endpoint books appointemnt and returns its uuid if slot is free
// Params needed:
// - userId: Stirng
// - hospitalName: String
// - timeSlot: String
app.post('/bookAppointment', function(req, res) {
	const userId = req.params.userId;
	const hospitalName = req.params.hospitalName;
	const timeSlot = req.params.timeSlot;
	if (userId == null || hospitalName == null || timeSlot == null) {
		res.status(400).json({"status":"error","message":"no enought parameters"});
		return;
	}

	const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

	client.connect(err => {
		const db = client.db("swiftuijam");
		const collection = db.collection("hospital_slots");
		const data = collection.find({"hospital_name":hospitalName}).toArray(function(err, result) {
	   		if (err) throw err;
	    	const slot = result[0]["slots"][timeSlot];
	    	if (slot !== "free") {
	    		res.status(400).json({"status":"error"});
	    		client.close();
	    		return;
	    	}

	    	const newUuid = uuid.v4();
	    	const appointment = {
	    		"uuid": newUuid,
	    		"user_id": userId,
	    		"hospital_name": hospitalName,
	    		"time_slot": timeSlot
	    	}
	    	const slots = result[0]["slots"];
	    	slots[timeSlot] = newUuid;

	    	collection.updateOne({"hospital_name":hospitalName}, {$set: { slots }}, function(hospitalError, hospitalResult) {
			    if (hospitalError) throw err1;

			    const appointmentCollection = db.collection("appointment");
	    		appointmentCollection.insertOne(appointment, function(appointmentError, appointmentResult) {
			    	res.status(200).json({"status":"ok","uuid":newUuid});
	    		});
		  	});	
		});
	});
});

// Endpoint creates new hospital
app.post('/addHospital', function(req, res) {
	if (req.params.hospitalName == null) {
		res.status(400).json({"error":"hospital name is missing"});
		return;
	}

	const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

	client.connect(err => {
		const db = client.db("swiftuijam");
		const collection = db.collection("hospital_slots");
		const data = {
			"hospital_name": req.params.hospitalName,
			"slots": {
				"900": "free",
	    		"930": "free",
	    		"1000": "free",
	    		"1030": "free",
	    		"1100": "free",
	    		"1130": "free",
	    		"1200": "free"
			}
		}
		collection.insertOne(data, function(err, result) {
			if (err) throw err;
			res.status(200).json({"status":"ok"});
		})
	});
});

// Util endpoint to clear database records
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

app.get('/clearAppointmentsData', function(req, res) {
	const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
	client.connect(err => {
		const db = client.db("swiftuijam");
		const collection = db.collection("appointment");
		const data = collection.deleteMany({}, function(err, result) {
	   		if (err) throw err;
	    

	    	res.status(200).json({"status":"ok"});	
		});
	});
});

/*
*
* Part related to fetch data related to numbers of vaccinations in different countries
*
*/


//Endpoint returns the newest statistics for the country selected in request parameters
// Params needed:
// - countryName: String
app.get('/newestData/:countryName', function(req, res) {
	if (req.params.countryName == null) {
		res.status(400).json({"message":"user id is missing"});
		return;
	}
	const results = [];
	const file = fs.createWriteStream("data/"+req.params.countryName+".csv");
		https.get("https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/vaccinations/country_data/"+req.params.countryName+".csv", function(response) {
		response.pipe(file);
		fs.createReadStream("data/" + req.params.countryName+".csv")
			.pipe(csv())
			.on('data', (data) => results.push(data))
			.on('end', () => {
			res.json(results[results.length-1]);
		});
	});
});

//Endpoint returns the all statistics for some country selected in request parameters
// Params needed:
// - countryName: String
app.get('/allData/:countryName', function(req, res) {
	if (req.params.countryName == null) {
		res.status(400).json({"message":"countryName name is missing"});
		return;
	}
	const results = [];
	const file = fs.createWriteStream("data/"+req.params.countryName+".csv");
	https.get("https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/vaccinations/country_data/"+req.params.countryName+".csv", function(response) {
		response.pipe(file);
		fs.createReadStream("data/" + req.params.countryName+".csv")
			.pipe(csv())
			.on('data', (data) => results.push(data))
			.on('end', () => {
			res.json(results);
		});
	});
});



app.listen(port, function() {
  console.log('App started');
});


