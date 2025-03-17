import express from 'express';
import mongoose from'mongoose';
import ChatLog from './chatlog.js';

const getChatLogs = async () => {
    try {
        const chatLogs = await ChatLog.find({});
        return chatLogs;
    } catch (error) {
        throw error;
    }
};

const deleteChatLog = async (req) => {
    try {
        const logId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(logId)) {
            throw new Error('Identifiant de log invalide');
        }
        const deletedLog = await ChatLog.findByIdAndDelete(logId);
        if (!deletedLog) {
            throw new Error('Log non trouvé');
        }
        return { message: 'Log supprimé avec succès' };
    } catch (error) {
        throw error;
    }
};

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const chatLogs = await getChatLogs();
        res.json(chatLogs);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des logs' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const result = await deleteChatLog(req);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;