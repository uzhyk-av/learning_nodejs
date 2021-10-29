const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http)
const mongoose = require('mongoose');
const { request } = require('http');

app.use( express.static(__dirname));
app.use( bodyParser.json() )
app.use( bodyParser.urlencoded({extended: false}))

mongoose.Promise = Promise;

let dbUrl = "mongodb+srv://mngdbUser:user@cluster0.sq6wi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

const Message = mongoose.model('Message', {
    name: String,
    message: String
})

app.get('/messages', (req, res)=>{
    Message.find({}, (err, messages)=>{
        res.send(messages)
    })
})

app.get('/messages/:user', (req, res)=>{
    let user = req.params.user;
    Message.find({name: user}, (err, messages)=>{
        res.send(messages)
    })
})

app.post('/messages', async (req, res) => {
    try {
        let message = new Message(req.body)
    
        let savedMessage = await message.save()
    
        console.log("saved");
        
        let censored = await Message.findOne({message: "badword"});
    
        if (censored) {
            console.log("Censored words found", censored);
            await Message.remove({_id: censored.id})
        } else {
            io.emit('message', req.body);
        }
    
        res.sendStatus(200);        
    } catch (error) {
        res.sendStatus(500);
        console.error(error);        
    } finally {
        console.log("Message post called.")
    }
})

app.post('/delete_message', async (req,res) => {
try {
    // console.log("req.body:", req.body.id)
    Message.deleteOne({_id:req.body.id}, () => {
        res.sendStatus(200);
    })
} catch (error) {
    console.log("Error:", err)
}
})
// io.on('connection', (socket)=>{
//     console.log("A user is connected")
// })

mongoose.connect(dbUrl, (err)=>{
    console.log("MongoDB connection", err)
})

const server = http.listen(3000, ()=>{
    console.log("Server is listening on port", server.address().port)
});