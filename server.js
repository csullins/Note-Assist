const express = require('express');
const path = require('path');
const fs = require('fs');
// Helper method for generating unique ids
const uuid = require('./helpers/uuid');
const app = express();

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
);

// GET request for loadiung page
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/notes.html'))
  });

// GET request for existing notes
app.get('/api/notes', (req, res) => {

  fs.readFile('db/db.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
    }
    else {
      // Convert string into JSON object
      const parsedNotes = JSON.parse(data);
      res.json(parsedNotes); 
    }
  });
  // Log the request to the terminal
  console.info(`${req.method} request received to get notes`);
});
  
app.post('/api/notes', (req, res) => {
  
  // Destructuring assignment for the items in req.body
  const { title, text } = req.body;

  // If all the required properties are present
  if (title && text) {
    // Variable for the object we will save
    const newNote = {
      title,
      text,
      id: uuid(),
    };
    // Obtain existing notes
    fs.readFile('db/db.json', 'utf8', (err, data) => {
        if (err) {
          console.error(err);
        } else {
          // Convert string into JSON object
          const parsedNotes = JSON.parse(data);
  
          // Add a new note
          parsedNotes.push(newNote);
  
          // Write updated note back to the file
          fs.writeFile('db/db.json',
            JSON.stringify(parsedNotes, null, 4),
            (writeErr) =>
              writeErr
                ? console.error(writeErr) : console.info('Successfully updated notes after adding new note!')
          );
        }
      });
      const response = {
        status: 'success',
        body: newNote,
      };
      res.status(201).json(response);
    } else {
      res.status(500).json('Error in posting new note');
    }
  });
  
  app.delete('/api/notes/:id', (req, res) => {

    const idParam = req.params.id;

    // Read the notes from the file
    const notes = JSON.parse(fs.readFileSync('db/db.json'));

    // Find the index of the note with the given ID
     const noteToDelete = notes.findIndex((notes) => notes.id === idParam);

    // Delete the note with specified id
    notes.splice(noteToDelete, 1);
    
        // Write updated note back to the file
        fs.writeFile('db/db.json',
        JSON.stringify(notes, null, 4),
        (writeErr) =>
          writeErr
            ? console.error(writeErr) : console.info('Successfully updated notes after deletion')
      ); 
      res.status(201).json('success');
    })

app.listen(port, () =>
  console.log(`App listening at http://localhost:${port} 🚀`)
  );
 