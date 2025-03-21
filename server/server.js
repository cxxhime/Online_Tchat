import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Définir __dirname
const __dirname = dirname(fileURLToPath(import.meta.url));

import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import connectDB from './database.js';
import chatRoutes from './routes.js';
import ChatLog from './chatlog.js';
import path from 'path';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Gestion des erreurs sur le WebSocketServer
wss.on('error', (error) => {
    console.error('Erreur sur le WebSocketServer :', error);
});

// Middleware pour servir les fichiers statiques
app.use(express.static(__dirname));

// Route pour la racine
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.use(express.json());
app.use('/api/chat', chatRoutes);

connectDB();

wss.on('connection', (ws) => {
    console.log('Nouvelle connexion WebSocket');
    ws.on('message', async (message) => {
        // Convertir le Buffer en chaîne de caractères
        const messageStr = message.toString('utf8');
        console.log('Message reçu :', messageStr);
        try {
            const data = JSON.parse(messageStr);
            if (!data.message ||!data.id ||!data.name ||!data.date ||!data.heure) {
                const errorMessage = { error: 'Message invalide, propriétés importantes manquantes' };
                ws.send(JSON.stringify(errorMessage));
                console.error("Message reçu invalide, propriétés importantes manquantes");
                return;
            }
            const chatLog = new ChatLog({
                id: data.id,
                name: data.name,
                message: data.message,
                date: data.date,
                heure: data.heure
            });
            await chatLog.save();

            // Parcourir les clients et envoyer le message à ceux dont l'état est OPEN
            wss.clients.forEach((client) => {
                try {
                    if (client.readyState === WebSocketServer.OPEN) {
                        console.log('Message à envoyer aux clients :', messageStr);
                        client.send(messageStr);
                        console.log('Message envoyé à un client');
                    }
                } catch (sendError) {
                    console.error('Erreur lors de l\'envoi du message à un client :', sendError);
                }
            });
        } catch (error) {
            if (error instanceof SyntaxError) {
                console.error("Erreur lors du parsing du message :", error);
            } else {
                console.error("Erreur lors de la sauvegarde du message dans la base de données :", error);
            }
        }
    });
    ws.on('close', () => {
        console.log('Connexion WebSocket fermée');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
