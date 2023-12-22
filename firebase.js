import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import {
    getFirestore,
    doc,
    collection,
    getDoc,
    query,
    where,
    getCountFromServer
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

export function get_ref(doc_id, coll_name) {
    return doc(db, coll_name, doc_id);
}

export async function check_cat_combo(cat_id_1, cat_id_2) {
    const cat_ref_1 = doc(db, 'categories', cat_id_1);
    const cat_ref_2 = doc(db, 'categories', cat_id_2);
    const cat_q_1 = `cat_map.${cat_id_1}`;
    const cat_q_2 = `cat_map.${cat_id_2}`;
    const q = query(
        charactersRef,
        where(cat_q_1, '==', true),
        where(cat_q_2, '==', true)
    );
    const snapshot = await getCountFromServer(q);
    // using snapshot.data().count allows us to get the length of this...
    // query's results without counting toward the read quota
    console.log(`${cat_id_1} && ${cat_id_2} count: ${snapshot.data().count}`);
}
