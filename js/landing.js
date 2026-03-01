// landing.js

const loginBtn = document.getElementById("loginBtn");
const startBtn = document.getElementById("startBtn");
const joinBtn = document.getElementById("joinBtn");
const joinInput = document.getElementById("joinSessionInput");

// Login with Firebase Auth
loginBtn.addEventListener("click", () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .catch(err => alert(err.message));
});

// Show game div if logged in
auth.onAuthStateChanged(user => {
  if (user) {
    document.getElementById("loginDiv").style.display = "none";
    document.getElementById("gameDiv").style.display = "block";
  }
});

// -------------------
// Start new game
// -------------------
startBtn.addEventListener("click", () => {
  // Generate short 6-character session code
  const sessionId = Math.random().toString(36).substr(2, 6).toUpperCase();
  const puzzles = generateSessionPuzzles();

  // Save session in Firebase
  db.ref("sessions/" + sessionId).set({
    puzzles,
    chat: {}
  });

  // Alert code so teammate can join
  alert("Share this session code with your teammate: " + sessionId);

  // Go to game page
  window.location.href = "game.html?session=" + sessionId;
});

// -------------------
// Join existing session
// -------------------
joinBtn.addEventListener("click", () => {
  const code = joinInput.value.trim().toUpperCase();
  if (!code) return alert("Enter a session code.");

  // Check if session exists
  db.ref("sessions/" + code).once("value", snap => {
    if (snap.exists()) {
      window.location.href = "game.html?session=" + code;
    } else {
      alert("Session not found. Check the code.");
    }
  });
});

// -------------------
// Generate random puzzles
// -------------------
function generateSessionPuzzles() {
  const puzzleTypes = ["logic", "scramble", "cipher"];
  const puzzles = {};
  const roomCount = 3 + Math.floor(Math.random() * 3); // 3-5 rooms

  for (let i = 1; i <= roomCount; i++) {
    const type = puzzleTypes[Math.floor(Math.random() * puzzleTypes.length)];
    puzzles["room" + i] = {
      type,
      solved: false,
      data: generatePuzzleData(type)
    };
  }

  return puzzles;
}

function generatePuzzleData(type) {
  if (type === "logic") {
    const start = Math.floor(Math.random() * 10);
    return {
      sequence: [start, start+2, start+4, "?"],
      answer: start+6
    };
  }

  if (type === "scramble") {
    const words = ["MOON","STAR","TREE","BOOK"];
    const word = words[Math.floor(Math.random() * words.length)];
    const scrambled = word.split("").sort(()=>0.5-Math.random()).join("");
    return { scrambled, answer: word };
  }

  if (type === "cipher") {
    const word = "CODE";
    const encoded = word.split("").map(c =>
      String.fromCharCode(c.charCodeAt(0)+2)
    ).join("");
    return { encoded, answer: word };
  }
}
