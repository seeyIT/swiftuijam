# Backend part of the main application [BookMyVaccine](https://github.com/aviralx10/BookMyVaccine) prepred for [SwiftUIJam](https://www.swiftuijam.com/)

**API address: [http://swiftuijam.herokuapp.com/](http://swiftuijam.herokuapp.com)**

#Endpoints:


**Part related to handle registration to be vaccinated**


1. /slots/:hospitalName [GET]  
Endpoint returns all slots for needed hospital  
Params:  
* hospitalName: String

2. /appointments/:userId [GET]  
Endpoint returns appointments for user ID  
Params:  
* userId: String

3. /bookAppointment [POST]  
Endpoint books appointment and returns its uuid if slot is free  
Params needed:  
* userId: String
* hospitalName: String
* timeSlot: String

4. /addHospital [POST]  
Endpoint creates new hospital  
Params needed:  
* hospitalName: String

5. /clearSlotsData [GET]  
Util endpoint to clear database records  

6. /clearAppointmentsData [GET]  
Util endpoint to clear database records



**Part related to fetch data related to numbers of vaccinations in different countries**

7. /newestData/:countryName [GET]  
Endpoint returns the newest statistics for the country selected in request parameters  
Params needed:
* countryName: String

8. /allData/:countryName [GET]  
Endpoint returns the all statistics for some country selected in request parameters  
Params needed: 
* countryName: String


# Database schema:

**hosital_slots** table
* hospital_name [String]
The name of hospital  
* slots [Dictionary<String, String>]  
List of the possible slots. Each slot has two values *free* or *value of uuid*  
If it's free then it's possibe to book appointment for that time otherwise it's uuid of appoitment.  
 
**appointment** table
* uuid [String]  
This uuid is the same as in hospital_slots table.  
* user_id [String]
* hospital_name [String]
* time_slot [String]
