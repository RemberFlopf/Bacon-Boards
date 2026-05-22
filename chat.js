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

            if (user.username === userLoggedIn && user.email === emailLoggedIn){

                console.log('logged in yay');
                loadRealPage();

            }

        }

    })

}

if (isSignInWithEmailLink(auth, window.location.href)){

    let emailLoggedIn = localStorage.getItem('baconChatEmail');
    let userLoggedIn = localStorage.getItem('baconChatUsername')

    signInWithEmailLink(auth, emailLoggedIn, window.location.href).then((result) => {

        let existing = {};

        get(ref(db, 'users')).then(doc => {

            if (doc.exists()){

                existing = doc.val();

            }

        })

        existing[result.user.uid] = ({username : userLoggedIn, email : emailLoggedIn});

        set(ref(db, 'users'), existing);

        loadRealPage();

    })

}

document.getElementById('submit').addEventListener('click', (event) => {

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

    sendSignInLinkToEmail(auth, email, actionCodeSettings).then(() => {

        localStorage.setItem("baconChatEmail", email);
        localStorage.setItem('baconChatUsername', document.querySelector('#usernameRegister').value.trim());

        console.log('Sent sign in link successfully!')
        document.querySelector('#check').style.display = 'inline';

    }).catch(err => {

        console.warn('Could not send sign in link!' + err.code + err.message);
        document.getElementById('submit').style.display = 'inline';

    })

})

let viewing = true;
let notif = new Audio('./notif.wav');

document.getElementById('baconChatForm').addEventListener('submit', (e) => {e.preventDefault(); addToBaconChat()})

document.addEventListener('keyup', (event) => {

    if (event.key === 'Enter'){

        addToBaconChat();

    }

})

onChildAdded(query(baconChat, limitToLast(1000)), (message) => {

    if (message.exists()){

        updateBaconChat(message)
        //clearBaconChat(message)

    }

    else{

        console.log("bacon not found!")

    }

})


function loadRealPage(){

    document.querySelector('#register').style.display = 'none';
    document.querySelectorAll('#baconChat, .baconChatWrapper').forEach(item => {

        item.style.display = 'flex';

    })

}

async function updateBaconChat(currentData){

    if (currentData.val().name === 'System'){

        remove(currentData.ref);
        console.log('removing miles hedrick');

    }

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

    //p.classList.add('bacon-ChatA')
    baconChat.appendChild(p)
    baconChat.scrollTop = baconChat.scrollHeight;

    console.log(viewing);

    if (!viewing){

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

    //let username = document.getElementById('username');
    let text = document.getElementById('baconChatInput');

   // console.log(username);

  //  let user = username.value.trim();

    let chat = text.value.trim();

    if (!chat || chat.length > 60){

        text.style.borderColor = 'red';
        return;

    }

    /*if (user.length > 25){

        username.style.borderColor = 'red';
        return;

    }*/

   // username.style.borderColor = '#d69286';
    text.style.borderColor = '#d69286';

    await get(ref(db, 'users')).then(doc => {

        if (doc.exists()){

            let username = doc.val()[auth.currentUser.uid].username;

            console.log(username);

            set(push(baconChat), {chat : chat, name : username || "Anonymous", type : 'text'})

        }

    })

    document.getElementById('baconChatInput').value = '';
    //document.getElementById('baconChatForm').reset()

}

/*async function clearBaconChat(currentData){

    if (Object.keys(currentData.val()).length > ){

        .then(() => {

            alert("Chat too long! Deleting contents...")

        }).catch(() => {

            console.error("Something went wrong. Chat could not be deleted.")

        })


    }

}*/

function notfiy(){

    document.addEventListener('visibilitychange', (event) => {

        viewing = !document.hidden;

    })

}

notfiy();
encodeImageFile();