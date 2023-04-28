const express = require("express")
const morgan = require('morgan')
const app = express()
const cors = require('cors')

app.use(cors())
app.use(express.static('dist'))//static files/compiled files(HTML & JS)
app.use(express.json())

// app.use(morgan((tokens, req, res) => {
//     return [
//       tokens.method(req, res),
//       tokens.url(req, res),
//       tokens.status(req, res),
//       tokens.res(req, res, 'content-length'), '-',
//       tokens['response-time'](req, res), 'ms',
//       JSON.stringify(req.body)
//     ].join(' ')
//   }))

let persons = [
    {
      id: 1,
      name: "Arto Hellas",
      number: "040-123456",
    },
    {
      id: 2,
      name: "Ada Lovelace",
      number: "39-44-5325325",
    },
    {
      id: 3,
      name: "Dan Abramov",
      number: "12-43-234345",
    },
    {
        id: 4,
        name: "Mary Poppendick",
        number: "39-23-64231243",
    }
  ]



  morgan.token("person", (req, res) => {
    if (req.method === "POST") return JSON.stringify(req.body);
    return null;
  });
  


  app.use(morgan(":method :url :status :res[content-length] - :response-time ms :person"));

  app.get("/", (req,res)=>{
    res.send("hola")
})

app.get("/api/persons", (req,res)=>{
    res.json(persons)
})

app.get("/info", (req,res)=>{
    const time = new Date()
    res.send(`
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${time}</p>
    `)
})

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = persons.find(x => x.id === id)
    
    if (person) {
      res.json(person)
    } else {
      res.status(404).end()
    }
  })

  app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    persons = persons.filter(x => x.id !== id)
    res.status(204).end()
  })

  const generateID = () =>{
    const newID = Math.round(Math.random()*90000)
    return newID
  }

  app.post("/api/persons", (req,res)=>{
    const newPerson = req.body
    const findName = persons.find(x => x.name === newPerson.name)

    if (!newPerson.name) {
        return res.status(400).json({ 
          error: 'name missing' 
        })
      } else if(!newPerson.number){
        return res.status(400).json({ 
            error: 'number missing' 
          })
      }
      else if(findName){
        return res.status(400).json({ 
            error: 'name must be unique' 
          })
      }

      else{

        const person = {
            id: generateID(),
            name: newPerson.name,
            number: newPerson.number
        }
        persons = persons.concat(person)
        res.json(person)
    }
  })


  const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  
  app.use(unknownEndpoint)




  const PORT = process.env.PORT || 3001
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })