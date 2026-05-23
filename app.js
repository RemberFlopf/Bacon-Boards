
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


const app = initializeApp(firebaseConfig);

const db = getDatabase(app, "https://chat-app-test-bb975-default-rtdb.asia-southeast1.firebasedatabase.app/");

const messages = ref(db, 'messages')

onValue(messages, (message) => {

    if (message.exists()){

        updateBoards(message)
        checkDuplicateData(message)
        baconOpinion(message)

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
        div.classList.add('centre', 'bacon-board')

        div.style.backgroundColor = baconTracker % 2 === 0 ? '#e1b28b' : '#f2c6ba';
        
        div.dataset.userId = object.key;


        div.addEventListener('mousedown', clearData)

        document.querySelector('#link').after(div)

        //console.log(object.val())

        baconTracker++;

    })

}

async function clearData(event){

    if (document.getElementById('username').value === 'superSecretAdminUsernameNoOneWillEverFind12345'){

        remove(ref(db, `messages/${event.target.dataset.userId}`)).then(() => {

            console.log("Data deleted succesfully!")

        }).catch((err) => {

            console.error("Data could not be deleted. " + err)

        })

    }

}

async function baconOpinion(currentData) {

    const baconOpinions = ['Crispy! 🥓', 'Sizzling! 🍳', 'Warming up! 🔥', 'Bacon. 🚳', 'A bit chilly! 😎', 'Undercooked! 😭', 'Raw! 🤢🤮']
    let overallBaconOpinion = 3;
    
    let opinionText = document.getElementById('opinion');

    currentData.forEach(object => {

        switch(object.val().choice){

            case "Hell Yeah! 😎":

                overallBaconOpinion --;
                break;

            case "Hell no! 🤮🤢":

                overallBaconOpinion ++;
                break;

            default:
                break;

        }

    })

    overallBaconOpinion = Math.max(0, Math.min(baconOpinions.length - 1, overallBaconOpinion))

    opinionText.textContent = baconOpinions[overallBaconOpinion];

    console.log(overallBaconOpinion, baconOpinions)


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

document.getElementById('baconForm').addEventListener('submit', (e) => {e.preventDefault(); addToDatabase()})

let buttonChoice = null;

async function addToDatabase(){

    let username = document.getElementById('username').value.trim();
    let warning = document.createElement('p');

    if (!username || username.length > 25){

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

