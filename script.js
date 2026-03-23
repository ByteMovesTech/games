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

  const game = generateGame();

  firebase.database().ref("rooms/" + room).set({
    game: game,
    stage: 0,
    progress: "playing",
    players: { A: playerName },
    chat: {}
  });

  document.getElementById("status").innerText = "Room Code: " + room;

  listenToRoom();
}

// JOIN ROOM
function joinRoom() {
  playerName = document.getElementById("playerName").value || "Player";
  room = document.getElementById("roomCode").value.toUpperCase();

  const roomRef = firebase.database().ref("rooms/" + room + "/players");

  roomRef.once("value", snap => {
    const players = snap.val() || {};

    if (!players.A) roomRef.update({ A: playerName });
    else if (!players.B) roomRef.update({ B: playerName });
    else {
      alert("Room full!");
      return;
    }

    document.getElementById("status").innerText = "Joined Room: " + room;

    listenToRoom();
  });
}

// LISTEN
function listenToRoom() {
  document.getElementById("chat").innerHTML = "";

  const roomRef = firebase.database().ref("rooms/" + room);

  roomRef.on("value", snap => {
    const data = snap.val();
    if (!data) return;

    const players = data.players || {};

    if (players.A === playerName) playerRole = "A";
    if (players.B === playerName) playerRole = "B";

    if (data.progress === "won") {
      document.getElementById("story").innerText =
        "The final lock clicks open... You made it out together.";
      document.getElementById("puzzle").innerText = "🎉 YOU ESCAPED!";
      return;
    }

    const stage = data.stage;
    const game = data.game[stage];

    if (!game) return;

    // STORY TEXT
    document.getElementById("story").innerText = game.story;

    // SPLIT CLUES
    if (playerRole === "A") {
      document.getElementById("puzzle").innerText = game.clueA;
    } else if (playerRole === "B") {
      document.getElementById("puzzle").innerText = game.clueB;
    } else {
      document.getElementById("puzzle").innerText = "Waiting for player...";
    }

    window.correctAnswer = game.answer;
  });

  // CHAT
  chatRef = firebase.database().ref("rooms/" + room + "/chat");

  chatRef.on("child_added", snap => {
    const data = snap.val();
    if (data && data.name && data.message) {
      const msgText = "<b>" + data.name + ":</b> " + data.message;
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

  const roomRef = firebase.database().ref("rooms/" + room);

  roomRef.once("value", snap => {
    const data = snap.val();
    const stage = data.stage;
    const game = data.game[stage];

    if (input === game.answer) {
      if (stage + 1 < data.game.length) {
        roomRef.update({ stage: stage + 1 });
      } else {
        roomRef.update({ progress: "won" });
      }
    } else {
      alert("Wrong answer!");
    }
  });
}

// GAME GENERATOR (Story + Balanced Tone)
function generateGame() {
  return [
    {
      story: "You both wake up in a dimly lit room. A locked box sits between you.",
      clueA: "The code starts with letters in 'trust'",
      clueB: "The code ends with letters in 'us'",
      answer: "52"
    },
    {
      story: "A dusty piano sits in the corner. One key is slightly worn.",
      clueA: "I have keys but no locks...",
      clueB: "I make music but have no mouth...",
      answer: "piano"
    },
    {
      story: "A note on the wall reads: 'Some things only work when two people figure them out together.'",
      clueA: "The number begins with 1",
      clueB: "It ends with 0",
      answer: "10"
    }
  ];
}
