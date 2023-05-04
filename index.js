require('dotenv').config()//always b4 load models
const Person = require("./models/person")
const express = require("express")
const morgan = require('morgan')
const app = express()
const cors = require('cors')


app.use(cors())
app.use(express.static('dist'))//static files/compiled files(HTML & JS)
app.use(express.json())


// let persons = [
///...
//   ]



  morgan.token("person", (req, res) => {
    if (req.method === "POST") return JSON.stringify(req.body);
    return null;
  });
  
  app.use(morgan(":method :url :status :res[content-length] - :response-time ms :person"));

  app.get("/", (req,res)=>{
    res.send("hola")
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(notes => {
    response.json(notes)
  })
})

app.get("/info", (req,res)=>{
  const time = new Date()
  Person.find({}).then(persons => {
    res.send(`
      <p>Phonebook has info for ${persons.length} people</p>
      <p>${time}</p>
    `)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body
  
  if (body.name === undefined || body.name === "") {
      return response.status(400).json({ error: 'name missing' })
  }
  
  const person = new Person({
      name: body.name,
      number: body.number
  })
  
  person.save().then(savedPerson => {
      response.json(savedPerson)
  })
  .catch(error => next(error))
})


app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body
  
    const person = {
      name: body.name,
      number: body.number
    }
  
    Person.findByIdAndUpdate(request.params.id, person, { new: true, runValidators: true})
    //newTrue: returns the new document not the old one
    //runValidators: we have to manually turn on  to validate new entry from postman, rest, etc...
      .then(updatedPerson => {
        response.json(updatedPerson)
      })
      .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
  }
app.use(unknownEndpoint)


const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
      return response.status(400).json({ error: error.message })
    }
  
    next(error)
}
  
app.use(errorHandler)


const PORT = process.env.PORT
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})