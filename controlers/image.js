const clarifai = require('clarifai')


const app = new Clarifai.App({
    apiKey: 'f16f960933da4a4ebb3db7846c569e01'
  });

const handleApiCall = (req, res) => {
    app.models
    .predict(
      {
        id: 'face-detection',
        name: 'face-detection',
        version: '5e026c5fae004ed4a83263ebaabec49e',
        type: 'visual-detector',
      }, req.body.input)
      .then(data => {
        res.json(data)
    })
    .catch(err => res.status(400).json('unable to work with API'))
}
  
const handleImage = (req,res, db)=> {
    const { id } = req.body;
    db('users')
    .where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
        res.json(entries[0].entries);
    })
    .catch(err => res.status(400).json('unable to get entries'))
}



module.exports = {
    handleImage,
    handleApiCall
}