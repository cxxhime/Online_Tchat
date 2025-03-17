const sendButton = document.getElementById('sendButton');
const messageInput = document.getElementById('messageInput');
const chatMessages = document.getElementById('chatMessages');

// Vérification que chatMessages est bien trouvé
if (!chatMessages) {
    console.error('L\'élément chatMessages n\'a pas été trouvé dans le DOM. Vérifiez l\'identifiant dans le HTML.');
}

// Créer une connexion WebSocket avec le serveur
let socket = new WebSocket('ws://localhost:3000');

function connect() {
    socket = new WebSocket('ws://localhost:3000');

    socket.onopen = function () {
        console.log('Connexion WebSocket ouverte');
    };

    socket.onmessage = function (event) {
        console.log('Démarrage du traitement du message reçu');
        try {
            const data = JSON.parse(event.data);
            if (data.error) {
                const errorMessage = createMessageElement(data.error, false);
                console.log('Message d\'erreur créé');
                if (chatMessages) {
                    chatMessages.appendChild(errorMessage);
                    console.log('Message d\'erreur ajouté à la zone de chat');
                } else {
                    console.error('L\'élément chatMessages n\'a pas été trouvé dans le DOM. Impossible d\'afficher le message d\'erreur.');
                }
            } else {
                const receivedMessage = data.message;
                const receivedMessageElement = createMessageElement(receivedMessage, false);
                console.log('Message créé pour l\'affichage :', receivedMessageElement.textContent);
                console.log('Vérification de l\'existence de chatMessages');
                if (chatMessages) {
                    console.log('chatMessages trouvé, ajout du message');
                    chatMessages.appendChild(receivedMessageElement);
                    console.log('Message ajouté à la zone de chat :', receivedMessage);
                } else {
                    console.error('L\'élément chatMessages n\'a pas été trouvé dans le DOM. Impossible d\'afficher le message.');
                }
            }
        } catch (parseError) {
            console.error("Erreur lors du parsing du message reçu :", parseError.message, "Message reçu :", event.data);
        }
        console.log('Fin du traitement du message reçu');
    };

    socket.onclose = function () {
        console.log("Déconnecté du serveur WebSocket");
        const disconnectedMessage = createMessageElement('Vous êtes déconnecté du serveur.', false);
        if (chatMessages) {
            chatMessages.appendChild(disconnectedMessage);
        } else {
            console.error('L\'élément chatMessages n\'a pas été trouvé dans le DOM. Impossible d\'afficher le message de déconnexion.');
        }
        setTimeout(connect, 1000); // Reconnect after 1 second
    };

    socket.onerror = function (error) {
        console.error("Erreur WebSocket :", error);
        const errorMessage = createMessageElement('Une erreur est survenue :'+ error.message, false);
        if (chatMessages) {
            chatMessages.appendChild(errorMessage);
        } else {
            console.error('L\'élément chatMessages n\'a pas été trouvé dans le DOM. Impossible d\'afficher le message d\'erreur.');
        }
    };
}

connect();

// Fonction pour créer un élément de message avec le bon style
function createMessageElement(message, isSent) {
    const messageElement = document.createElement('div');
    messageElement.classList.add(isSent? "sent" : "received");
    messageElement.textContent = message;
    return messageElement;
}

// Fonction pour envoyer le message avec vérification de l'état de la connexion
function sendMessage() {
    if (socket.readyState === WebSocket.OPEN) {
        const message = messageInput.value;
        if (message.trim()!== '') {
            // Créer un objet JSON pour l'envoi
            const dataToSend = {
                message: message,
                id: 'default_id', // Valeur par défaut pour l'identifiant
                name: 'Anonyme', // Valeur par défaut pour le nom
                date: new Date().toISOString().split('T')[0], // Date du jour
                heure: new Date().toISOString().split('T')[1].split('.')[0], // Heure actuelle
            };

            // Vérifier que l'objet est correctement formé avant de le convertir en JSON
            if (typeof dataToSend.message ==='string' &&
                typeof dataToSend.id ==='string' &&
                typeof dataToSend.name ==='string' &&
                typeof dataToSend.date ==='string' &&
                typeof dataToSend.heure ==='string') {
                const jsonData = JSON.stringify(dataToSend);
                console.log('Message à envoyer au serveur :', jsonData);

                // Ajout du message à l'affichage local (comme envoyé par l'utilisateur)
                const sentMessageElement = createMessageElement(message, true);
                if (chatMessages) {
                    chatMessages.appendChild(sentMessageElement);
                } else {
                    console.error('L\'élément chatMessages n\'a pas été trouvé dans le DOM. Impossible d\'afficher le message envoyé.');
                }

                // Envoyer le message au serveur
                socket.send(jsonData);

                // Efface le contenu de la zone de saisie
                messageInput.value = '';
            } else {
                console.error('Le message n\'est pas correctement formé. Certaines propriétés manquent ou sont de type incorrect.');
            }
        }
    } else {
        console.error('Le WebSocket n\'est pas ouvert. Impossible d\'envoyer le message.');
    }
}

// Écouteur d'événement pour le clic sur le bouton d'envoi
sendButton.addEventListener('click', function (event) {
    event.preventDefault();
    sendMessage();
});

// Optionnel : Gérer l'envoi du message avec la touche Entrée
messageInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendMessage();
    }
});