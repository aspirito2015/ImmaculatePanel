import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import {
    getFirestore,
    doc,
    collection,
    getDoc
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';

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
const categoriesRef = collection(db, 'categories');


export async function get_data_by_id(doc_id, coll_name) {
    const docRef = doc(db, coll_name, doc_id);
    const docSnap = await getDoc(docRef);
    return docSnap.data();
}
