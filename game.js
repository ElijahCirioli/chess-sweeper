let board; // the grid of cells
let pieceCounts; // the numbers of each piece available
let selectedPiece; // the piece that the user is placing
let timerStart; // the start time of the game
let elapsedTime; // how much time has elapsed since that start time
let mineCells; // a list of cells that are mines
let level; // the current level

function startGame(levelIndex) {
	// load level information
	level = JSON.parse(JSON.stringify(levels[levelIndex]));
	pieceCounts = level.pieces;
	pieceCounts.flag = level.numMines;

	// add in scoring information
	level.incorrectGuesses = 0;
	level.hintMultiplier = 1;

	// generate the board grid
	generateBoard(level.boardSize);
	// delay generating mines until after the first piece has been placed
	mineCells = [];

	startTimer();

	// update the piece count elements
	for (const type in pieceCounts) {
		$(`#piece-selection-${type}`).children(".piece-selection-counter").text(pieceCounts[type]);
		if (pieceCounts[type] > 0) {
			$(`#piece-selection-${type}`).children(".piece-selection-image").attr("draggable", "true");
		}
	}

	// update the div visibility
	hideAllMenus();
	$("#piece-selection-wrap").show();
	$("#icon-bar-wrap").css("visibility", "visible");
	$("#board").show();
	$("#main-menu-wrap").hide();
	$("#blocker").hide();
	showTopIcons();
}

function generateBoard(size) {
	$(".cell").remove();

	// generate the cells
	board = [];
	for (let y = 0; y < size; y++) {
		let row = [];
		for (let x = 0; x < size; x++) {
			row.push(new Cell(x, y));
		}
		board.push(row);
	}

	// calculate sizes
	const divSize = $("#board").width();
	const cellSize = divSize / size;

	// update css based on sizes
	$("#board").css("grid-template-columns", `repeat(${size}, ${cellSize}px)`);
	$("#board").css("grid-template-rows", `repeat(${size}, ${cellSize}px)`);

	$("#preview-piece").css("width", `${0.92 * cellSize}px`);
	$("#preview-piece").css("height", `${0.92 * cellSize}px`);

	$(".piece-mine-number").css("line-height", `${cellSize}px`);
	$(".piece-mine-number").css("font-size", `${Math.floor(0.72 * cellSize)}px`);
}

function generateMines(x, y) {
	let mx, my;
	for (let i = 0; i < level.numMines; i++) {
		/* repeatedly generate new coordinates until they aren't a mine and they 
		aren't x and y coordinates provided */
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
	$(".piece-selection").on("click dragstart", function () {
		const type = $(this).attr("id").split("-")[2];

		// unselect if this is selected already
		if ($(this).hasClass("selected")) {
			$(".piece-selection").removeClass("selected");
			$(".cell").css("cursor", "default");
			selectedPiece = undefined;
			return;
		}

		// make sure there are pieces of this type left
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
	// check all mines for flags
	for (const cell of mineCells) {
		if (!cell.hasFlag()) {
			return;
		}
	}

	// they have won
	$("#blocker").show();
	stopTimer();

	// reveal all the mines
	for (let i = 0; i < mineCells.length; i++) {
		setTimeout(() => {
			mineCells[i].revealMine();
		}, i * 100);
	}

	// show the win screen
	setTimeout(showWinMenu, mineCells.length * 100 + 2000);
}

function checkForLoss() {
	// check all the mines for pieces
	for (const cell of mineCells) {
		if (cell.hasPiece()) {
			// they have lost
			$("#blocker").show();
			hideTopIcons();
			stopTimer();

			// explode all the mines
			explodeMines(cell);

			// show the lose screen
			setTimeout(showLoseMenu, mineCells.length * 160 + 2000);
			return;
		}
	}
}

function explodeMines(cell) {
	// sort the mines based on how close they are
	mineCells.sort((a, b) => {
		const distA = Math.pow(cell.getX() - a.getX(), 2) + Math.pow(cell.getY() - a.getY(), 2);
		const distB = Math.pow(cell.getX() - b.getX(), 2) + Math.pow(cell.getY() - b.getY(), 2);
		return distA - distB;
	});

	const explosionRadius = (0.75 * $("#board").width()) / board.length;
	for (let i = 0; i < mineCells.length; i++) {
		setTimeout(() => {
			mineCells[i].explode(explosionRadius);
		}, i * 160);
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

	elapsedTime = Math.floor((Date.now() - timerStart) / 1000);

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
	setupMenuEventListeners();
	showMainMenu();
	resize();
};
