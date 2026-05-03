const introText = "Happy Birthday 甄宇良";
const typingDelayMs = 120;
const holdDurationMs = 10000;

const introScreen = document.getElementById("intro-screen");
const galleryScreen = document.getElementById("gallery-screen");
const typedTitle = document.getElementById("typed-title");
const memoryGrid = document.getElementById("memory-grid");
const gridView = document.getElementById("grid-view");
const detailView = document.getElementById("detail-view");
const detailImage = document.getElementById("detail-image");
const detailDate = document.getElementById("detail-date");
const detailTitle = document.getElementById("detail-title");
const detailBody = document.getElementById("detail-body");
const backButton = document.getElementById("back-button");

const memoryData = [
  { year: 2020, month: "January", title: "A New Start", body: "A cozy start to a new year full of adventures and warm memories.", img: "https://picsum.photos/seed/hb-01/720/720" },
  { year: 2020, month: "March", title: "Spring Walk", body: "The beginning of spring and long walks with bright skies.", img: "https://picsum.photos/seed/hb-02/720/720" },
  { year: 2020, month: "June", title: "Summer Light", body: "A sunny afternoon where every photo felt full of joy.", img: "https://picsum.photos/seed/hb-03/720/720" },
  { year: 2020, month: "September", title: "Autumn Colors", body: "Golden leaves, cool air, and a perfect day to remember.", img: "https://picsum.photos/seed/hb-04/720/720" },
  { year: 2021, month: "January", title: "Coffee & Laughs", body: "A simple day with big smiles and even bigger laughter.", img: "https://picsum.photos/seed/hb-05/720/720" },
  { year: 2021, month: "April", title: "Road Trip", body: "Windows down, music on, and the road stretching ahead.", img: "https://picsum.photos/seed/hb-06/720/720" },
  { year: 2021, month: "July", title: "Beach Day", body: "Warm sand, ocean breeze, and unforgettable sunset views.", img: "https://picsum.photos/seed/hb-07/720/720" },
  { year: 2021, month: "October", title: "Night Lights", body: "A city evening glowing with lights and celebration.", img: "https://picsum.photos/seed/hb-08/720/720" },
  { year: 2022, month: "February", title: "Festival Mood", body: "Colorful moments and meaningful time with loved ones.", img: "https://picsum.photos/seed/hb-09/720/720" },
  { year: 2022, month: "May", title: "Garden Morning", body: "Soft morning sun and flowers in full bloom.", img: "https://picsum.photos/seed/hb-10/720/720" },
  { year: 2022, month: "August", title: "Mountain Air", body: "A refreshing escape and calm views above the clouds.", img: "https://picsum.photos/seed/hb-11/720/720" },
  { year: 2022, month: "November", title: "Family Gathering", body: "Warm food, warm hearts, and stories around a table.", img: "https://picsum.photos/seed/hb-12/720/720" },
  { year: 2023, month: "January", title: "Fresh Chapter", body: "Another chapter begins with hope and grateful memories.", img: "https://picsum.photos/seed/hb-13/720/720" },
  { year: 2023, month: "April", title: "Picnic Day", body: "A sunny afternoon and plenty of moments worth keeping.", img: "https://picsum.photos/seed/hb-14/720/720" },
  { year: 2023, month: "July", title: "Golden Hour", body: "Evening light that made every second look cinematic.", img: "https://picsum.photos/seed/hb-15/720/720" },
  { year: 2023, month: "December", title: "Year End Glow", body: "A beautiful close to the year, full of gratitude and joy.", img: "https://picsum.photos/seed/hb-16/720/720" }
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function typeIntroText(text) {
  typedTitle.textContent = "";
  for (let i = 0; i < text.length; i += 1) {
    typedTitle.textContent += text[i];
    await sleep(typingDelayMs);
  }
  typedTitle.classList.add("done");
}

function showScreen(showEl, hideEl) {
  hideEl.classList.remove("active");
  hideEl.setAttribute("aria-hidden", "true");

  setTimeout(() => {
    showEl.classList.add("active");
    showEl.setAttribute("aria-hidden", "false");
  }, 200);
}

function renderMemoryGrid() {
  const fragment = document.createDocumentFragment();

  memoryData.forEach((item, index) => {
    const button = document.createElement("button");
    button.className = "memory-card";
    button.type = "button";
    button.setAttribute("aria-label", `${item.month} ${item.year} memory`);

    const photoWindow = document.createElement("span");
    photoWindow.className = "photo-window";

    const img = document.createElement("img");
    img.src = item.img;
    img.alt = `${item.title} - ${item.month} ${item.year}`;
    img.loading = "lazy";
    photoWindow.appendChild(img);

    const overlay = document.createElement("span");
    overlay.className = "card-overlay";
    overlay.textContent = `${item.year} / ${item.month}`;

    button.append(photoWindow, overlay);
    button.addEventListener("click", () => openDetail(index));
    fragment.appendChild(button);
  });

  memoryGrid.appendChild(fragment);
}

function openDetail(index) {
  const item = memoryData[index];
  detailImage.src = item.img;
  detailImage.alt = `${item.title} - ${item.month} ${item.year}`;
  detailDate.textContent = `${item.month} ${item.year}`;
  detailTitle.textContent = item.title;
  detailBody.textContent = item.body;

  gridView.classList.remove("active");
  gridView.setAttribute("aria-hidden", "true");

  setTimeout(() => {
    detailView.classList.add("active");
    detailView.setAttribute("aria-hidden", "false");
  }, 180);
}

function closeDetail() {
  detailView.classList.remove("active");
  detailView.setAttribute("aria-hidden", "true");

  setTimeout(() => {
    gridView.classList.add("active");
    gridView.setAttribute("aria-hidden", "false");
  }, 180);
}

async function runIntroFlow() {
  await typeIntroText(introText);
  await sleep(holdDurationMs);
  showScreen(galleryScreen, introScreen);
}

backButton.addEventListener("click", closeDetail);
renderMemoryGrid();
runIntroFlow();
