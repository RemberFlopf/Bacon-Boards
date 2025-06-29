
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getDatabase, ref, push, set, get, remove, onValue } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration

const firebaseConfig = {

apiKey: "AIzaSyC9Eos8fKKu8Dmtj6XVW0yMLLQ9CJsw0E4",

authDomain: "chat-app-test-bb975.firebaseapp.com",

projectId: "chat-app-test-bb975",

storageBucket: "chat-app-test-bb975.firebasestorage.app",

messagingSenderId: "66794630272",

appId: "1:66794630272:web:8a49c45d6194df5af68a65"

};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getDatabase(app, "https://chat-app-test-bb975-default-rtdb.asia-southeast1.firebasedatabase.app/");

const messages = ref(db, 'messages')

onValue(messages, (message) => {

    if (message.exists()){

        updateBoards(message)
        checkDuplicateData(message)

    }

    else{

        console.log("where the bacon at?")

    }

})

let baconTracker = 0;

async function updateBoards(currentData){

    document.querySelectorAll('.bacon-board').forEach(b => b.remove())

    currentData.forEach(object => {

        let div = document.createElement('div');

        div.innerHTML = `<p>Name : ${object.val().name}</p><p>Choice : ${object.val().choice}</p>`;

        div.style.marginBottom = '1em';
        div.style.marginTop = '1em'
        div.style.backgroundColor = baconTracker % 2 === 0 ? 'lightgray' : 'gray';
        div.classList.add('centre', 'bacon-board')
        div.style.flexDirection = 'column';

        document.getElementById('baconForm').after(div)

        //console.log(object.val())

        baconTracker++;

    })

}

async function checkDuplicateData(currentData){

    let messageStorage = new Map()

    currentData.forEach((object) => {

        if (messageStorage.has(object.val().name)){

            remove(ref(db, `messages/${object.key}`)).then(() => {

                console.log('Duplicate data removed!')

            }).catch(err => {

                console.error("Duplicate data could not be removed.")

            })

        }

        messageStorage.set(object.val().name, object.val().choice);


    })

}

//Set - adds the thing
//Messages - thing you are adding to (the folder basically)
//Push - gives it a random id like a subfolder
//Change the path like this to set a specific name.

//set((ref(db, 'messages/name')), {'bob' : 'ross'});

//remove well... removes data. You can also just set the data to null. TDLR; Push sucks because it makes data annoying to access. Name your data. 

//remove presumably also returns a promise 
//im pretty sure 'then' is reserved for promises

/*remove(messages).then(() => {

    console.log("messages deleted!")

}).catch((err) => {

    console.error("uh oh something went wrong")

})*/

document.getElementById('baconForm').addEventListener('submit', (e) => {e.preventDefault(); addToDatabase()})

//Get reads the database but returns a promise

get(messages).then(message => {

    if (message.exists()){

        //console.log(message.val())

    }

}).catch((err) => {

    console.log('Oh No! You suck. Loser. Imagine getting an error. Could not be me.')
    console.error(err)

})

//Async example

//Basically, async looks more like normal code. Thats literally it. I hate it. 

async function readDatabase(){

    try{

        const message = await get(messages);

        if (message.exists()){

            //console.log(message.val())

        }

        else{

            console.log("Data not found!")

        }

    }

    catch(err){

        // most useful code ive ever written

        throw new Error(err)

    }

}

readDatabase()

let success = Math.random() < 0.5 ? false : true;

const bacon = new Promise((resolve, reject) => {

    if (success){

        resolve('I am become bacon, destroyer of worlds.')

    }

    else{

        reject("Bacon again? Really?")

    }

})

bacon.then((message) => {

    console.log("Success! " + message)

}).catch((message) => {

    console.log('Failure! ' + message)

})

let buttonChoice = null;

async function addToDatabase(){

    let username = document.getElementById('username').value.trim();
    let warning = document.createElement('p');

    if (!username || username.length > 20){

        document.getElementById('username').style.borderColor = 'red';
        return;

    }

    document.getElementById('username').style.borderColor = 'lightgrey';

        let radioButtons = document.getElementsByName('baconQuiz')

        for (let button of radioButtons){

            if (button.checked){

                buttonChoice = button.labels[0].textContent;

                console.log(button.labels[0].textContent)

            }

        }

        set(push(messages), {name : username, choice : buttonChoice})

        document.getElementById('baconForm').reset()

    }

