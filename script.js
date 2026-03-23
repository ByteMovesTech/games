// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCNvc-KTRnSrQfU0lIkK9I-t4qSdx1cG4s",
  authDomain: "cookiecuttervault.firebaseapp.com",
  databaseURL: "https://cookiecuttervault-default-rtdb.firebaseio.com/",
  projectId: "cookiecuttervault",
  storageBucket: "cookiecuttervault.firebasestorage.app",
  messagingSenderId: "900114441261",
  appId: "1:900114441261:web:fd4f37af79e928933344a4"
};

firebase.initializeApp(firebaseConfig);

let room = "";
let playerName = "";
let playerRole = "";
let chatRef;

// CREATE ROOM
function createRoom() {
  playerName = document.getElementById("playerName").value || "Player";
  room = Math.random().toString(36).substring(2,6).toUpperCase();
  playerRole = "A";

  document.getElementById("status").innerText = "Room Code: " + room;

  const game = generateGame();

  firebase.database().ref("rooms/" + room).set({
    game: game,
    progress: "playing",
    chat: {}
  });

  listenToRoom();
}

// JOIN ROOM
function joinRoom() {
  playerName = document.getElementById("playerName").value || "Player";
  room = document.getElementById("roomCode").value.toUpperCase();
  playerRole = "B";

  if (!room) {
    alert("Enter a room code");
    return;
  }

  document.getElementById("status").innerText = "Joined Room: " + room;

  listenToRoom();
}

// LISTEN
function listenToRoom() {
  document.getElementById("chat").innerHTML = "";

  const roomRef = firebase.database().ref("rooms/" + room);

  roomRef.on("value", snap => {
    const data = snap.val();
    if (!data) return;

    if (data.progress === "won") {
      document.getElementById("puzzle").innerText = "🎉 YOU ESCAPED!";
      return;
    }

    const game = data.game;

    if (playerRole === "A") {
      document.getElementById("puzzle").innerText = game.clueA;
    } else {
      document.getElementById("puzzle").innerText = game.clueB;
    }

    window.correctAnswer = game.answer;
  });

  // Chat
  chatRef = firebase.database().ref("rooms/" + room + "/chat");

  chatRef.on("child_added", snap => {
    const data = snap.val();
    if (data && data.name && data.message) {
      const msgText = `<b>${data.name}:</b> ${data.message}`;
      document.getElementById("chat").innerHTML += "<div>" + msgText + "</div>";
      document.getElementById("chat").scrollTop = document.getElementById("chat").scrollHeight;
    }
  });
}

// SEND MESSAGE
function sendMessage() {
  const msg = document.getElementById("message").value;
  if (!msg || !chatRef) return;

  chatRef.push({
    name: playerName,
    message: msg
  });

  document.getElementById("message").value = "";
}

// SUBMIT ANSWER
function submitAnswer() {
  const input = document.getElementById("answer").value.toLowerCase();

  if (input === window.correctAnswer) {
    firebase.database().ref("rooms/" + room + "/progress").set("won");
  } else {
    alert("Wrong answer!");
  }
}

// GAME GENERATOR (Split Clues)
function generateGame() {
  const games = [
    {
      clueA: "The code starts with the number of letters in 'love'",
      clueB: "The code ends with the number of letters in 'us'",
      answer: "42"
    },
    {
      clueA: "Think of something that echoes...",
      clueB: "It speaks without a mouth...",
      answer: "echo"
    },
    {
      clueA: "First number is days in a weekend",
      clueB: "Second number is months in a year",
      answer: "212"
    }
  ];

  return games[Math.floor(Math.random() * games.length)];
}
