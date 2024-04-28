const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const dictionary = require('./dictionary.json');
const articles = require('./articles.json');

app.use(express.static('public'));
app.use(express.static('images'));

app.get('/api/definition', (req, res) => {
    const word = req.query.word.toLowerCase();
    const definition = dictionary[word];
    if (definition) {
        res.json({ definition });
    } else {
        res.status(404).json({ message: 'Definition not found' });
    }
});

app.get('/api/suggestions', (req, res) => {
    const prefix = req.query.prefix.toLowerCase();
    const suggestions = Object.keys(dictionary).filter(word => word.startsWith(prefix)).slice(0, );
    res.json({ suggestions });
});

app.get('/api/wordOfTheDay', (req, res) => {
    const randomWord = Object.keys(dictionary)[Math.floor(Math.random() * Object.keys(dictionary).length)];
    const definition = dictionary[randomWord];
    res.json({ word: randomWord, definition });
});

app.get('/api/articles', (req, res) => {
    res.json(articles);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
