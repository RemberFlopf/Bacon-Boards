import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getAuth, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink  } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
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

const auth = getAuth(app);
const baconChat = ref(db, 'baconChat')

logIn();

function logIn(){

    get(ref(db, 'users')).then(doc => {

        if (doc.exists()){

            let emailLoggedIn = localStorage.getItem('baconChatEmail');
            let userLoggedIn = localStorage.getItem('baconChatUsername');

            let user = doc.val()[auth.currentUser.uid];

            if (user.username.toLowerCase() === userLoggedIn.toLowerCase() && user.email.toLowerCase() === emailLoggedIn.toLowerCase()){

                loadRealPage();

            }

        }

    }).catch(err => {

        document.querySelector('#loading').style.display = 'none';
        document.querySelector('#register').style.display = 'flex';

        loadRealPage();


    })

}

if (isSignInWithEmailLink(auth, window.location.href)){

    let emailLoggedIn = localStorage.getItem('baconChatEmail');
    let userLoggedIn = localStorage.getItem('baconChatUsername')

    signInWithEmailLink(auth, emailLoggedIn, window.location.href).then(async (result) => {

        let existing = {};

        get(ref(db, 'users')).then(doc => {

            if (doc.exists()){

                existing = doc.val();
                existing[result.user.uid] = ({username : userLoggedIn, email : emailLoggedIn});

                set(ref(db, 'users'), existing);

                console.log('loading frmo email link')
                loadRealPage();

            }

        })

    })

}

document.getElementById('registerForm').addEventListener('submit', (event) => {

    event.preventDefault();

    document.getElementById('submit').style.display = 'none';

    const actionCodeSettings = {

        url : 'https://bacon-boards.onrender.com/chat.html',
        handleCodeInApp: true,
        iOS: {
            bundleId: 'com.example.ios'
        },
        android: {
            packageName: 'com.example.android',
            installApp: true,
            minimumVersion: '12'
        },

    }

    let email = document.querySelector('#email').value.trim();
    let username = document.querySelector('#usernameRegister')
    let user = username.value.trim();
    
    if (user.length > 30){

        username.style.borderColor = 'red';
        document.getElementById('submit').style.display = 'inline';
        return;

    }

    username.style.borderColor = '#d69286';

    sendSignInLinkToEmail(auth, email, actionCodeSettings).then(() => {

        localStorage.setItem("baconChatEmail", email);
        localStorage.setItem('baconChatUsername', user);

        console.log('Sent sign in link successfully!')
        document.querySelector('#check').style.display = 'inline';

    }).catch(err => {

        console.warn('Could not send sign in link!' + err.code + err.message);
        document.getElementById('submit').style.display = 'inline';

    })

})

let viewing = true;
let spamming = false;
let notif = new Audio('./notif.wav');

document.getElementById('baconChatForm').addEventListener('submit', (e) => {e.preventDefault(); addToBaconChat()})

onChildAdded(query(baconChat, limitToLast(100)), (message) => {

    if (message.exists()){

        updateBaconChat(message)
        //clearBaconChat(message)

    }

    else{

        console.log("bacon not found!")

    }

})

function loadRealPage(){

    let baconChat = document.querySelector('#baconChat');

    document.querySelector('#register').style.display = 'none';
    document.querySelector('#loading').style.display = 'none';
    document.querySelectorAll('#baconChat, .baconChatWrapper').forEach(item => {

        item.style.display = 'flex';

    })

    setTimeout(() => {baconChat.scrollTop = baconChat.scrollHeight}, 500);

}

async function updateBaconChat(currentData){

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

        p.textContent = `${currentData.val().name} : `;
        p.style.fontWeight = 700;

        p.appendChild(img);

    }

    else{

        let name = document.createElement('b');
        let text = document.createElement('p');


        text.textContent = currentData.val().chat;
        text.style.display = 'inline';
        name.style.display = 'inline';

        name.textContent = currentData.val().name + ' : ';

        p.appendChild(name);
        p.appendChild(text);

    }

    baconChat.appendChild(p)
    baconChat.scrollTop = baconChat.scrollHeight;

    if (!viewing){

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

                add(fileEncoded, 'image');
                //set(push(baconChat), {chat : fileEncoded, name : document.getElementById('username').value.trim() || "Anonymous", type : 'image'})

            }

            reader.readAsDataURL(file);

        }

    })


}

async function add(chat, type){

    get(ref(db, 'users')).then(doc => {

        if (doc.exists()){

            let username = doc.val()[auth.currentUser.uid].username;
            let count = 0;

            set(push(baconChat), {chat : chat, name : username || "Anonymous", type : type})

            if (Math.random() < 0.1){

                get(query(baconChat, limitToLast(10))).then(doc => {

                    if (doc.exists()){

                        doc.forEach(obj => {

                            if (obj.val().name.toLowerCase() === username.toLowerCase()){

                                count++;

                            }

                        })

                        if (count === 10){
   
                            const opts = ["Dude genuinely who are you even talking to", 'bro literally no one cares', 'pls shut up'];

                            set(push(baconChat), {chat : opts[Math.floor(Math.random()*opts.length)], name : 'Plinkes', type : 'text'});


                        }
                    }

                })

            }

        }

    })

}

let spammer;

async function addToBaconChat(){

    let text = document.getElementById('baconChatInput');

    clearTimeout(spammer);

    spammer = setTimeout(() => {

        console.log('disabling spam')
        spamming = false;

    }, 800)

    let chat = text.value.trim();

    if (!chat || chat.length > 240 || spamming){

        spamming = true;
        text.style.borderColor = 'red';
        return;

    }

    spamming = true;

    text.style.borderColor = '#d69286';

    add(chat, 'text');

    document.getElementById('baconChatInput').value = '';
}

function notfiy(){

    document.addEventListener('visibilitychange', (event) => {

        viewing = !document.hidden;

    })

}

notfiy();
encodeImageFile();