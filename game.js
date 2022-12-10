let board;
let pieceCounts;
let selectedPiece;
let timerStart;
let numMines;
let mineCells;

function startGame(size, pieces, mines) {
	pieceCounts = pieces;
	pieceCounts.flag = mines;
	numMines = mines;
	mineCells = [];
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

	$(".piece-mine-number").css("line-height", `${cellSize}px`);
	$(".piece-mine-number").css("font-size", `${Math.floor(0.72 * cellSize)}px`);
}

function generateMines(x, y) {
	let mx, my;
	for (let i = 0; i < numMines; i++) {
		do {
			mx = Math.floor(Math.random() * board.length);
			my = Math.floor(Math.random() * board.length);
		} while (board[my][mx].hasMine() || (x === mx && y === my));

		mineCells.push(board[my][mx]);
		board[my][mx].setMine();
	}
}

function setupEventListeners() {
	// piece selection mouse events
	$(".piece-selection").on("mousedown", function () {
		const type = $(this).attr("id").split("-")[2];

		if ($(this).hasClass("selected")) {
			$(".piece-selection").removeClass("selected");
			$(".cell").css("cursor", "default");
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
		$(".cell").css("cursor", "pointer");
		$("#note-buttons-wrap").css("visibility", "hidden");
		$("#note-buttons-wrap").children().removeClass("selected");
		$("#note-button").show();
		$("#context-menu").hide();
		$(".cell").removeClass("menu-selected");
	});

	// unselect piece when clicking background
	$("body").on("click", function (e) {
		if (e.target === e.currentTarget || $(e.target).attr("id") === "title-wrap") {
			$(".piece-selection").removeClass("selected");
			$(".cell").css("cursor", "default");
			$("#preview-piece").hide();
			$("#note-button").show();
			$("#note-buttons-wrap").css("visibility", "hidden");
			$("#note-buttons-wrap").children().removeClass("selected");
			$("#context-menu").hide();
			$(".cell").removeClass("menu-selected");
			selectedPiece = undefined;
		}
	});

	// note tools
	$("#note-button").on("click", function () {
		$("#note-button").hide();
		$("#note-buttons-wrap").css("visibility", "visible");
		$("#safe-note-button").click();
		$("#context-menu").hide();
		$(".cell").removeClass("menu-selected");
	});

	$("#safe-note-button").on("click", function () {
		$("#note-buttons-wrap").children().removeClass("selected");
		$("#safe-note-button").addClass("selected");
		$(".piece-selection").removeClass("selected");
		$(".cell").css("cursor", "default");
		$("#preview-piece").attr("src", "images/pencil.png");
		$("#context-menu").hide();
		$(".cell").removeClass("menu-selected");
		selectedPiece = "safeNote";
	});

	$("#flag-note-button").on("click", function () {
		$("#note-buttons-wrap").children().removeClass("selected");
		$("#flag-note-button").addClass("selected");
		$(".piece-selection").removeClass("selected");
		$(".cell").css("cursor", "default");
		$("#preview-piece").attr("src", "images/pencil.png");
		$("#context-menu").hide();
		$(".cell").removeClass("menu-selected");
		selectedPiece = "flagNote";
	});

	// preview piece mouse events
	$("#board").on("mouseenter", function () {
		if (selectedPiece) {
			$("#preview-piece").show();
		}
	});
	$("#board").on("mouseleave", function () {
		$("#preview-piece").hide();
		$(".cell").removeClass("highlight");
	});
	$("#board").on("mousemove", function (e) {
		const rect = $("#board")[0].getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		const halfWidth = $("#preview-piece").width() / 2;

		$("#preview-piece").css("left", `${x - halfWidth}px`);
		$("#preview-piece").css("top", `${y - halfWidth}px`);
	});

	// context menu
	$("#context-menu").on("mouseenter", function () {
		$(".cell").removeClass("highlight");
	});
}

function updateAllMineCounts() {
	for (const row of board) {
		for (const cell of row) {
			cell.updateMineCount();
		}
	}
}

function highlightPossibleMoves(moves) {
	$(".cell").removeClass("highlight");
	for (const m of moves) {
		board[m.y][m.x].highlight();
	}
}

function checkForWin() {
	for (const cell of mineCells) {
		if (!cell.hasFlag()) {
			return;
		}
	}
	alert("You win");
}

function checkForLoss() {
	for (const cell of mineCells) {
		if (cell.hasPiece()) {
			alert("You lose");
		}
	}
}

function startTimer() {
	timerStart = Date.now();
	requestAnimationFrame(updateTimer);
}

function stopTimer() {
	timerStart = undefined;
}

function updateTimer() {
	if (!timerStart) {
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
	setupEventListeners();
	startGame(10, { pawn: 12, rook: 6, knight: 8, king: 1, queen: 2, bishop: 4 }, 10);
};
