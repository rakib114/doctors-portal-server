const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const fileUpload = require('express-fileupload');
const MongoClient = require("mongodb").MongoClient;
require('dotenv').config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.irvi8.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;


const app = express();

app.use(bodyParser.json());
app.use(cors());

app.use(express.static('doctors'));
app.use(fileUpload());

const port = 5000;

app.get("/", (req, res) => {
    res.send("hello it's from db working working");
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const appointmentsCollection = client.db("doctorsPortal").collection("appoinments");
    const doctorCollection = client.db("doctorsPortal").collection("doctors");
    app.post('/addAppointment', (req, res) => {
        const appointment = req.body;
        console.log(appointment);
        appointmentsCollection.insertOne(appointment)
            .then(result => {
                res.send(result.acknowledged === true);
            })
    })

    app.post('/appointmentsByDate', (req, res) => {
        const date = req.body;
        appointmentsCollection.find({ date: date.date })
            .toArray((error, documents) => {
                res.send(documents);
                // console.log(error);
            })
    })

    //All Patients List 
    app.get('/appointments', (req, res) => {
        appointmentsCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })
    //Add a Doctor
    app.post('/addADoctor', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const email = req.body.email;
        console.log(name, email, file);
        file.mv(`${__dirname}/doctors/${file.name}`, error => {
            if (error) {
                console.log(error);
                return res.status(5000).send({ msg: 'Failed to Upload Image' })
            }
            doctorCollection.insertOne({ name, email, img: file.name })
                .then(result => {
                    res.send(result.acknowledged === true);
                })
        })
    })
    app.get('/doctors', (req, res) => {
        doctorCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });
    //Cheking Docotors email
    app.post('/isDoctor', (req, res) => {
        const email = req.body.email;
        doctorCollection.find({ email: email })
            .toArray((error, doctors) => {
                res.send(doctors.length > 0)
            })
    })
});

app.listen(process.env.PORT || port);