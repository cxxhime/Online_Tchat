import mongoose from'mongoose';

const chatLogSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    heure: {
        type: String,
        required: true
    }
});

const ChatLog = mongoose.model('ChatLog', chatLogSchema);

export default ChatLog;