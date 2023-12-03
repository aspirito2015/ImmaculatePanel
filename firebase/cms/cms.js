/*
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
*/

async function main() {
    document.getElementById("do-something").addEventListener('click', callPythonFunction, false);
    console.log("finished main()");
    /*
    */
}

main();


function doSomething() {
    fetch('https://marvel.fandom.com/wiki/')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text;
        }).then(data => {
            console.log(data);
        }).catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}


function callPythonFunction() {
    fetch('/call_python_function')
        .then(response => response.text())
        .then(result => {
            document.getElementById('result').innerText = result;
        });
}