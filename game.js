let board;
let pieceCounts;
let selectedPiece;
let timerStart;
let numMines;
let hasPlacedMines;

function startGame(size, pieces, mines) {
	pieceCounts = pieces;
	pieceCounts.flag = mines;
	numMines = mines;
	hasPlacedMines = false;
	generateBoard(size);
	startTimer();

	for (const type in pieceCounts) {
		$(`#piece-selection-${type}`).children(".piece-selection-counter").text(pieceCounts[type]);
	}
}

function generateBoard(size) {
	$(".cell").remove();
	const divSize = $("#board").width();
	const cellSize = divSize / size;
	board = [];
	for (let y = 0; y < size; y++) {
		let row = [];
		for (let x = 0; x < size; x++) {
			row.push(new Cell(x, y));
		}
		board.push(row);
	}
	$("#board").css("grid-template-columns", `repeat(${size}, ${cellSize}px)`);
	$("#board").css("grid-template-rows", `repeat(${size}, ${cellSize}px)`);

	$("#preview-piece").css("width", `${0.92 * cellSize}px`);
	$("#preview-piece").css("height", `${0.92 * cellSize}px`);
}

function setupEventListeners() {
	// piece selection mouse events
	$(".piece-selection").on("mousedown", function () {
		const type = $(this).attr("id").split("-")[2];

		if ($(this).hasClass("selected")) {
			$(".piece-selection").removeClass("selected");
			selectedPiece = undefined;
			return;
		}

		if (pieceCounts[type] <= 0) {
			return;
		}
		selectedPiece = type;
		$(".piece-selection").removeClass("selected");
		$(this).addClass("selected");
		$("#preview-piece").attr("src", `images/${selectedPiece}.png`);
	});

	// preview piece mouse events
	$("#board").on("mouseenter", function () {
		if (selectedPiece) {
			$("#preview-piece").show();
		}
	});
	$("#board").on("mouseleave", function () {
		$("#preview-piece").hide();
	});
	$("#board").on("mousemove", function (e) {
		const rect = $("#board")[0].getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		const halfWidth = $("#preview-piece").width() / 2;

		$("#preview-piece").css("left", `${x - halfWidth}px`);
		$("#preview-piece").css("top", `${y - halfWidth}px`);
	});

	$("body").on("click", function (e) {
		if (e.target === e.currentTarget) {
			$(".piece-selection").removeClass("selected");
			$("#preview-piece").hide();
			selectedPiece = undefined;
		}
	});
}

function updateAllMineCounts() {}

function checkForWin() {}

function checkForLoss() {}

function startTimer() {
	timerStart = Date.now();
}

function stopTimer() {
	timerStart = undefined;
}

function updateTimer() {
	if (!timerStart) {
		requestAnimationFrame(updateTimer);
		return;
	}

	const elapsedTime = Math.floor((Date.now() - timerStart) / 1000);

	const secondString = (elapsedTime % 60).toString().padStart(2, "0");
	const minuteString = (Math.floor(elapsedTime / 60) % 60).toString().padStart(2, "0");
	const hourString = (Math.floor(elapsedTime / 3600) % 100).toString().padStart(2, "0");

	let timerString = `${minuteString}:${secondString}`;
	if (hourString !== "00") {
		timerString = `${hourString}:${timerString}`;
	}

	$("#timer").text(timerString);

	requestAnimationFrame(updateTimer);
}

window.onload = () => {
	updateTimer();
	setupEventListeners();
	startGame(10, { pawn: 12, rook: 6, knight: 8, king: 1, queen: 2, bishop: 4 }, 10);
};
