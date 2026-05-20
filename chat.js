import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getDatabase, ref, push, set, get, remove, onValue } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js";

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

const baconChat = ref(db, 'baconChat')

document.getElementById('baconChatForm').addEventListener('submit', (e) => {e.preventDefault(); addToBaconChat()})

onValue(baconChat, (message) => {

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

    currentData.forEach(object => {

        let baconChat = document.getElementById('baconChat');
        let p = document.createElement('div')

        if (object.val().type === 'image'){

            let img = new Image();
            
            img.src = object.val().chat;


            p.innerHTML = `<b>${object.val().name}</b> : `;

            p.appendChild(img);

        }

        else{

            p.innerHTML = `<b>${object.val().name}</b> : ${object.val().chat}`;

        }


        //p.classList.add('bacon-ChatA')
        baconChat.appendChild(p)
        baconChat.scrollTop = baconChat.scrollHeight;

    })

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

    let chat = text.value.trim();

    if (!chat || chat.length > 60){

        text.style.borderColor = 'red';
        return;

    }

    if (username.value.trim().length > 25){

        username.style.borderColor = 'red';
        return;

    }

    username.style.borderColor = '#d69286';
    text.style.borderColor = '#d69286';

    set(push(baconChat), {chat : chat, name : document.getElementById('username').value.trim() || "Anonymous", type : 'text'})

    document.getElementById('baconChatForm').reset()

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

encodeImageFile();