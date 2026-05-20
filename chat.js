import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getDatabase, ref, push, set, get, remove, onValue, onChildAdded, limitToLast, query } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js";

const firebaseConfig = {

    apiKey: "AIzaSyC9Eos8fKKu8Dmtj6XVW0yMLLQ9CJsw0E4",

    authDomain: "chat-app-test-bb975.firebaseapp.com",

    projectId: "chat-app-test-bb975",

    storageBucket: "chat-app-test-bb975.firebasestorage.app",

    messagingSenderId: "66794630272",

    appId: "1:66794630272:web:8a49c45d6194df5af68a65"

};

const app = initializeApp(firebaseConfig);

const db = getDatabase(app, "wss://chat-app-test-bb975-default-rtdb.asia-southeast1.firebasedatabase.app/");

const baconChat = ref(db, 'baconChat')

let viewing = true;
let notif = new Audio('./notif.wav');

document.getElementById('baconChatForm').addEventListener('submit', (e) => {e.preventDefault(); addToBaconChat()})

document.addEventListener('keyup', (event) => {

    if (event.key === 'Enter'){

        addToBaconChat();

    }

})

onChildAdded(query(baconChat, limitToLast(100)), (message) => {

    if (message.exists()){

        updateBaconChat(message)
        clearBaconChat(message)

    }

    else{

        console.log("bacon not found!")

    }

})


async function updateBaconChat(currentData){

    document.querySelectorAll('.bacon-Chat').forEach(p => p.remove())

    let baconChat = document.getElementById('baconChat');
    let p = document.createElement('div')

    if (currentData.val().type === 'image'){

        let img = new Image();
        
        fetch(currentData.val().chat)
        .then(res => res.blob())
        .then(blob => {

            const blobUrl = URL.createObjectURL(blob);
            img.src = blobUrl;

        });



        img.loading = 'lazy';

        p.innerHTML = `<b>${currentData.val().name}</b> : `;

        p.appendChild(img);

    }

    else{

        p.innerHTML = `<b>${currentData.val().name}</b> : ${currentData.val().chat}`;

    }

    //p.classList.add('bacon-ChatA')
    baconChat.appendChild(p)
    baconChat.scrollTop = baconChat.scrollHeight;

    if (currentData.val().name !== document.querySelector('#username').value.trim() && !viewing){

        console.log('attemping to play sound')

        notif.play();

    }

}

function encodeImageFile(){

    let upload = document.querySelector('#upload');
    let fileEncoded = null;

    upload.addEventListener('change', () => {

        let file = upload?.files?.[0];

        if (typeof file !== 'undefined'){

            let reader = new FileReader();
            reader.onloadend = function(){

                fileEncoded = reader.result;
                set(push(baconChat), {chat : fileEncoded, name : document.getElementById('username').value.trim() || "Anonymous", type : 'image'})

            }

            reader.readAsDataURL(file);

        }

    })


}

async function addToBaconChat(){

    let username = document.getElementById('username');
    let text = document.getElementById('baconChatInput');

    let user = username.value.trim();

    let chat = text.value.trim();

    if (!chat || chat.length > 60){

        text.style.borderColor = 'red';
        return;

    }

    if (user.length > 25){

        username.style.borderColor = 'red';
        return;

    }

    username.style.borderColor = '#d69286';
    text.style.borderColor = '#d69286';

    set(push(baconChat), {chat : chat, name : user || "Anonymous", type : 'text'})

    document.getElementById('baconChatInput').value = '';
    //document.getElementById('baconChatForm').reset()

}

async function clearBaconChat(currentData){

    if (Object.keys(currentData.val()).length > 1500){

        remove(baconChat).then(() => {

            alert("Chat too long! Deleting contents...")

        }).catch(() => {

            console.error("Something went wrong. Chat could not be deleted.")

        })

    }

}

function notfiy(){

    document.addEventListener('visibilitychange', (event) => {

        viewing = !document.hidden;

    })

}

notfiy();
encodeImageFile();