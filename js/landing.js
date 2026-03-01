const loginBtn = document.getElementById("loginBtn");
const startBtn = document.getElementById("startBtn");

loginBtn.addEventListener("click", () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .catch(err => alert(err.message));
});

auth.onAuthStateChanged(user => {
  if (user) {
    document.getElementById("loginDiv").style.display = "none";
    document.getElementById("gameDiv").style.display = "block";
  }
});

startBtn.addEventListener("click", () => {
  const sessionId = Math.random().toString(36).substr(2, 9);
  const puzzles = generateSessionPuzzles();
  db.ref("sessions/" + sessionId).set({
    puzzles,
    chat: {}
  });
  window.location.href = "game.html?session=" + sessionId;
});

function generateSessionPuzzles() {
  const puzzleTypes = ["logic", "scramble", "cipher"];
  const puzzles = {};
  const roomCount = 3 + Math.floor(Math.random() * 3);

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
