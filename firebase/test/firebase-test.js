import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import {
    getFirestore,
    addDoc,
    doc,
    collection,
    query,
    orderBy,
    onSnapshot,
    Timestamp,
    where,
    getDocs
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
const answersRef = collection(db, 'answers');
const charactersRef = collection(db, 'characters');

async function main() {
    let form = document.getElementById("leave-message");
    let ans_b = [];
    let ans_c = new Array(9).fill(doc(db, "characters", "oROwXqp4zlXB8ZbVFV1G"));

    const q1 = query(charactersRef, where("name", "==", "test00"));
    const querySnapshot = await getDocs(q1);

    querySnapshot.forEach((doc) => {
        console.log(doc.id, " => ", doc.data());
    });

    for (let i=0; i<ans_c.length; i++) {
        
    }

    // Listen to the form submission
    form.addEventListener('submit', async e => {
        // Prevent the default form redirect
        e.preventDefault();
        // Get values of checkboxes
        let checkboxes = document.getElementsByClassName("checkbox");
        console.log(checkboxes);
        for (var i=0; i<checkboxes.length; i++) {
            ans_b[i] = checkboxes[i].checked;
        }
        console.log(ans_b);
        // Write a new message to the database collection "answers"
        addDoc(answersRef, {
            correct_arr: ans_b,
            char_arr: ans_c,
            submitted: Timestamp.now()
        });
        // Return false to avoid redirect
        return false;
    });

    // Create query for messages
    const q2 = query(answersRef);
    onSnapshot(q2, snaps => {
        // Reset page
        guestbook.innerHTML = '';
        // Loop through documents in database
        snaps.forEach(doc => {
            // Create an HTML entry for each document and add it to the chat
            const entry = document.createElement('p');
            entry.textContent = doc.data().correct_arr + ': ' + doc.data().submitted.toDate();
            guestbook.appendChild(entry);
        });
    });
}

main();
