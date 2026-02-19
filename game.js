const storyEl = document.getElementById("story");
const choicesEl = document.getElementById("choices");
const cluesEl = document.getElementById("clues");
const restartBtn = document.getElementById("restartBtn");

let state = {
  node: "start",
  clues: new Set(),
};

const NODES = {
  start: {
    text: `You arrive at a silent house. Patrol says the door was unlocked.
The kitchen light is on. A body lies near the sink.`,
    choices: [
      { label: "Inspect the body", next: "body" },
      { label: "Search the living room first", next: "livingRoom" },
      { label: "Check the back door for entry signs", next: "backDoor" },
    ],
  },

  body: {
    text: `The victim is cold. No wallet. A strange symbol is carved into the forearm.
There’s a faint smell of bleach.`,
    onEnter: () => addClue("Symbol carved into forearm"),
    choices: [
      { label: "Photograph the symbol and bag the victim’s hand", next: "symbol" },
      { label: "Check pockets and clothing seams", next: "pockets" },
      { label: "Look under the sink", next: "sink" },
    ],
  },

  livingRoom: {
    text: `The living room is neat—too neat. A framed photo is slightly crooked.
A thin layer of dust avoids one patch of carpet.`,
    choices: [
      { label: "Lift the crooked frame", next: "frame" },
      { label: "Inspect the clean patch on the carpet", next: "carpet" },
      { label: "Return to the kitchen", next: "body" },
    ],
  },

  backDoor: {
    text: `The back door lock isn’t forced. But the mud outside has a fresh sneaker print.
Size looks small… maybe a teen or a small adult.`,
    onEnter: () => addClue("Fresh sneaker print outside back door"),
    choices: [
      { label: "Photograph the print and note tread pattern", next: "print" },
      { label: "Check the trash bins outside", next: "bins" },
      { label: "Go back inside", next: "start" },
    ],
  },

  symbol: {
    text: `Close-up photo reveals the symbol is layered: carved, then burned lightly.
It’s meant to be recognized.`,
    onEnter: () => addClue("Symbol appears carved then lightly burned"),
    choices: [
      { label: "Search the house for matching symbol", next: "searchSymbol" },
      { label: "Return to scene overview", next: "start" },
    ],
  },

  pockets: {
    text: `Inside the jacket lining you find a receipt: “Pine Hollow Storage — Unit 12B.”
Time stamp: yesterday, 11:48 PM.`,
    onEnter: () => addClue("Receipt: Pine Hollow Storage — Unit 12B"),
    choices: [
      { label: "Bag the receipt and check victim’s phone", next: "phone" },
      { label: "Return to scene overview", next: "start" },
    ],
  },

  sink: {
    text: `Under the sink: an empty bleach bottle and a torn latex glove.
The tear suggests a hurried removal.`,
    onEnter: () => addClue("Torn latex glove under the sink"),
    choices: [
      { label: "Dust the cabinet handle for prints", next: "prints" },
      { label: "Return to scene overview", next: "start" },
    ],
  },

  frame: {
    text: `Behind the frame is a small safe. It’s locked, but the keypad has smudges on 1, 2, and 0.`,
    onEnter: () => addClue("Hidden safe; keypad smudges on 1, 2, 0"),
    choices: [
      { label: "Try code 120", next: "safe120" },
      { label: "Try code 210", next: "safe210" },
      { label: "Leave it for forensics", next: "start" },
    ],
  },

  carpet: {
    text: `Under the clean patch is a loose floor vent. Inside: a small USB drive.`,
    onEnter: () => addClue("USB drive hidden in floor vent"),
    choices: [
      { label: "Bag the USB as evidence", next: "usb" },
      { label: "Return to scene overview", next: "start" },
    ],
  },

  print: {
    text: `The tread is a common brand, but there’s a nick on the outer heel—unique.
This can match a specific shoe later.`,
    onEnter: () => addClue("Shoe tread has unique nick on outer heel"),
    choices: [
      { label: "Return to scene overview", next: "start" },
    ],
  },

  bins: {
    text: `In the trash bin you find a shredded envelope. One piece shows a name: “M. RIV—”`,
    onEnter: () => addClue("Shredded envelope fragment: “M. RIV—”"),
    choices: [
      { label: "Return to scene overview", next: "start" },
    ],
  },

  phone: {
    text: `Victim’s phone is missing. Whoever did this knew what to take.
But the receipt gives you a next location.`,
    choices: [
      { label: "Close the scene and open a lead board", next: "leadBoard" },
      { label: "Keep searching for more evidence", next: "start" },
    ],
  },

  prints: {
    text: `Partial prints on the cabinet handle. Enough for a comparison, not a clean ID.`,
    onEnter: () => addClue("Partial fingerprints on sink cabinet handle"),
    choices: [
      { label: "Return to scene overview", next: "start" },
    ],
  },

  safe120: {
    text: `BEEP. The safe opens. Inside is a second USB and a handwritten note:
“12B isn’t what it seems.”`,
    onEnter: () => addClue("Safe opened with 120; note: “12B isn’t what it seems”"),
    choices: [
      { label: "End demo (Case continues...)", next: "end" },
      { label: "Restart case", next: "start", reset: true },
    ],
  },

  safe210: {
    text: `BEEP-BEEP. Wrong code. The keypad locks for 30 seconds.`,
    choices: [
      { label: "Return to scene overview", next: "start" },
    ],
  },

  usb: {
    text: `The USB is labeled with a tiny marker: “EVIDENCE?”. Someone wanted you to find it.`,
    onEnter: () => addClue("USB labeled “EVIDENCE?”"),
    choices: [
      { label: "End demo (Case continues...)", next: "end" },
      { label: "Restart case", next: "start", reset: true },
    ],
  },

  searchSymbol: {
    text: `You don’t find the symbol elsewhere… which means it’s not random.
It’s a message, not a signature.`,
    choices: [
      { label: "Return to scene overview", next: "start" },
    ],
  },

  leadBoard: {
    text: `LEADS:
• Storage Unit 12B
• Unknown symbol
• Shoe print with unique nick
You’re ready to move the investigation forward.`,
    choices: [
      { label: "End demo (Case continues...)", next: "end" },
      { label: "Restart case", next: "start", reset: true },
    ],
  },

  end: {
    text: `CASE FILE UPDATED.
You collected enough evidence to open the next lead.
(We can build Case 002 next.)`,
    choices: [
      { label: "Restart Case 001", next: "start", reset: true },
    ],
  },
};

function addClue(text) {
  state.clues.add(text);
  renderClues();
}

function renderClues() {
  cluesEl.innerHTML = "";
  [...state.clues].forEach(c => {
    const li = document.createElement("li");
    li.textContent = c;
    cluesEl.appendChild(li);
  });
}

function go(nodeKey, reset=false) {
  if (reset) state = { node: "start", clues: new Set() };

  state.node = nodeKey;
  const node = NODES[nodeKey];

  storyEl.textContent = node.text;

  if (node.onEnter) node.onEnter();

  choicesEl.innerHTML = "";
  node.choices.forEach(ch => {
    const btn = document.createElement("button");
    btn.className = "primary";
    btn.textContent = ch.label;
    btn.onclick = () => go(ch.next, !!ch.reset);
    choicesEl.appendChild(btn);
  });

  renderClues();
}

restartBtn.addEventListener("click", () => go("start", true));

go("start");
