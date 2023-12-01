import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import {
    getFirestore,
    addDoc,
    collection,
    query,
    orderBy,
    onSnapshot,
    Timestamp
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBNGvghLLvatMD7tuANyX6tyAtsEKPik5w",
    authDomain: "immaculate-panel.firebaseapp.com",
    projectId: "immaculate-panel",
    storageBucket: "immaculate-panel.appspot.com",
    messagingSenderId: "806020093352",
    appId: "1:806020093352:web:cbf4f970ab2b6ed4c1b99d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function main() {
    let form = document.getElementById("leave-message");
    let input = document.getElementById("message");
    let checkboxes = document.getElementsByTagName("input");
    let ans_b = [];
    let ans_c = new Array(9).fill("characters/oROwXqp4zlXB8ZbVFV1G");
    for (var i=0; i<checkboxes.length; i++) {
        ans_b[i] = checkboxes.checked;
    } 
    // Listen to the form submission
    form.addEventListener('submit', async e => {
        // Prevent the default form redirect
        e.preventDefault();
        // Write a new message to the database collection "guestbook"
        addDoc(collection(db, 'answers'), {
            correct_arr: [true, true, true, true, true, true, true, true, true],
            timestamp: Timestamp.now(),
            name: "Anthony!",
        });
        // Return false to avoid redirect
        return false;
    });


    // Create query for messages
    const q = query(collection(db, 'answers'));
    onSnapshot(q, snaps => {
        // Reset page
        guestbook.innerHTML = '';
        // Loop through documents in database
        snaps.forEach(doc => {
            // Create an HTML entry for each document and add it to the chat
            const entry = document.createElement('p');
            entry.textContent = doc.data().correct_arr + ': ' + doc.data().datetime;
            guestbook.appendChild(entry);
        });
    });

}

main();
