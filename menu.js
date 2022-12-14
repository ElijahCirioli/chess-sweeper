function setupMenuEventListeners() {
	$(".menu-close-button").on("click", function () {
		hideAllMenus();
	});

	$("#menu-wrap").on("click", function (e) {
		if (e.target === e.currentTarget && $("#hint-menu").css("display") !== "none") {
			hideAllMenus();
		}
	});

	// tutorial
	$("#tutorial-button").on("click", function () {
		showTutorial();
	});

	$("#tutorial-close-button").off("click");
	$("#tutorial-close-button").on("click", function () {
		showMainMenu();
	});

	// hint menu
	$("#hint-button").on("click", function () {
		$("#menu-wrap").show();
		$(".menu").hide();
		hideTopIcons();
		$("#hint-menu").show();
	});

	$("#hint-contradiction-button").on("click", function () {
		hideAllMenus();
		$(".cell").removeClass("hint-highlight");
		for (const row of board) {
			for (const cell of row) {
				if (cell.hasPiece() && getMineCount(cell) !== getFlagCount(cell)) {
					cell.highlightHint();
				}
			}
		}
		level.hintMultiplier *= 0.9;
	});

	$("#hint-blind-spots-button").on("click", function () {
		hideAllMenus();
		const covered = [];
		for (const row of board) {
			const coveredRow = [];
			for (const cell of row) {
				coveredRow.push(cell.hasPiece() || cell.hasFlag());
				if (cell.getElement().hasClass("hint-highlight") && cell.getMarking() === 2) {
					cell.mark("flagNote");
				}
			}
			covered.push(coveredRow);
		}
		$(".cell").removeClass("hint-highlight");

		for (const row of board) {
			for (const cell of row) {
				if (!cell.hasPiece()) {
					continue;
				}

				const moves = getVisibleMoves(cell);
				for (const m of moves) {
					covered[m.y][m.x] = true;
				}
			}
		}

		for (const row of board) {
			for (const cell of row) {
				if (!covered[cell.getY()][cell.getX()]) {
					cell.highlightHint();
					if (cell.getMarking() !== 2) {
						cell.mark("flagNote");
					}
				}
			}
		}
		level.hintMultiplier *= 0.9;
	});

	$("#hint-correct-button").on("click", function () {
		hideAllMenus();
		if (mineCells.length === 0) {
			generateMines(-1, -1);
		}
		for (const cell of mineCells) {
			if (cell.hasFlag()) {
				cell.revealMine();
			}
		}
		level.hintMultiplier *= 0.75;
	});

	$("#hint-reveal-button").on("click", function () {
		hideAllMenus();
		if (mineCells.length === 0) {
			generateMines(-1, -1);
		}
		for (const cell of mineCells) {
			if (!cell.hasFlag() && !cell.getElement().hasClass("mine")) {
				cell.revealMine();
				break;
			}
		}
		level.hintMultiplier *= 0.75;
	});

	// quit menu
	$("#back-button").on("click", function () {
		$("#menu-wrap").show();
		$(".menu").hide();
		hideTopIcons();
		$("#quit-menu").show();
	});

	$("#quit-confirm-button").on("click", function () {
		hideAllMenus();
		if (mineCells.length === 0) {
			generateMines(-1, -1);
		}

		$("#blocker").show();
		hideTopIcons();
		stopTimer();
		explodeMines(mineCells[0]);
		setTimeout(showLoseMenu, board.length * 160 + 2500);
	});

	// game over menus
	$(".play-again-button").on("click", function () {
		startGame(level.number - 1);
	});

	$(".home-button").on("click", function () {
		showMainMenu();
	});
}

function hideAllMenus() {
	$("#menu-wrap").hide();
	$(".menu").hide();
	$(".game-over-menu").hide();
	$(".game-over-menu").addClass("game-over-menu-hidden");
	$("#tutorial-wrap").hide();
	$("#main-menu-wrap").hide();
	showTopIcons();
}

function hideTopIcons() {
	$("#icon-bar-right-wrap").hide();
	$("#back-button").hide();
}

function showTopIcons() {
	$("#icon-bar-right-wrap").show();
	$("#back-button").show();
}

function showLoseMenu() {
	$("#piece-selection-wrap").hide();
	$("#menu-wrap").show();
	$(".menu").hide();
	hideTopIcons();
	$("#lose-menu").show();
	$(".game-over-menu").removeClass("game-over-menu-hidden");
}

function showWinMenu() {
	$("#piece-selection-wrap").hide();
	$("#menu-wrap").show();
	$(".menu").hide();
	hideTopIcons();
	$("#win-menu").show();
	$(".game-over-menu").removeClass("game-over-menu-hidden");
	generateScoreDisplay();
}

function generateScoreDisplay() {
	$(".score-row").remove();
	$("#new-highscore-message").remove();

	let score = level.baseScore;
	$("#score-wrap").append(
		`<div class="score-row"><p>Level ${level.number} complete:</p><p>${score}</p></div>`
	);

	let timeBonus = 0;
	if (elapsedTime < level.maximumMinutes * 60) {
		timeBonus = Math.ceil((level.maximumMinutes * 60 - elapsedTime) * 5);
	}
	score += timeBonus;
	$("#score-wrap").append(`<div class="score-row"><p>Time bonus:</p><p>+${timeBonus}</p></div>`);

	let pieceBonus = 0;
	for (const piece in pieceCounts) {
		pieceBonus += pieceCounts[piece];
	}
	pieceBonus *= 250;
	score += pieceBonus;
	$("#score-wrap").append(`<div class="score-row"><p>Extra pieces bonus:</p><p>+${pieceBonus}</p></div>`);

	let guessingPenalty = Math.min(100 * level.incorrectGuesses, score);
	$("#score-wrap").append(
		`<div class="score-row"><p>Guessing penalty:</p><p>-${guessingPenalty}</p></div>`
	);
	score -= guessingPenalty;

	if (level.hintMultiplier !== 1) {
		level.hintMultiplier = Math.round(Math.max(0.1, level.hintMultiplier) * 100) / 100;
		score = Math.round(score * level.hintMultiplier);
		$("#score-wrap").append(
			`<div class="score-row"><p>Hint penalty:</p><p>x${level.hintMultiplier.toPrecision(2)}</p></div>`
		);
	}

	$("#score-wrap").append(`<div class="score-row"><p><b>Total:</b></p><p><b>${score}</b></p></div>`);

	const highscoreKey = `elijah-cirioli-chess-sweeper-highscore-level-${level.number}`;
	const highscore = localStorage.getItem(highscoreKey);
	if (highscore === null || score > parseInt(highscore)) {
		localStorage.setItem(highscoreKey, score);
		$("#score-wrap").append(`<p id="new-highscore-message">New personal best</p>`);
	}
}

function showMainMenu() {
	hideAllMenus();
	$("#icon-bar-wrap").css("visibility", "hidden");
	$("#board").hide();
	$("#blocker").hide();
	$("#piece-selection-wrap").hide();
	$("#main-menu-wrap").show();
	generateLevelSelect(0);
}

function generateLevelSelect(levelIndex) {
	$("#level-selection-wrap").empty();

	// previous level
	if (levelIndex > 0) {
		$("#level-selection-wrap").append(
			`<button class="level-selection-arrow-button" id="previous-level-button"></button>`
		);
		$("#level-selection-wrap").append(
			`<h2 class="level-selection-icon" style="background-color: ${levels[levelIndex - 1].color};">${
				levels[levelIndex - 1].number
			}</h2>`
		);
	} else {
		$("#level-selection-wrap").append(`<div class="level-selection-spacer"></div>`);
	}

	// current level
	$("#level-selection-wrap").append(
		`<h2 id="current-level-icon" class="level-selection-icon" style="background-color: ${levels[levelIndex].color};">${levels[levelIndex].number}</h2>`
	);

	// next level
	if (levelIndex < levels.length - 1) {
		$("#level-selection-wrap").append(
			`<h2 class="level-selection-icon" style="background-color: ${levels[levelIndex + 1].color};">${
				levels[levelIndex + 1].number
			}</h2>`
		);
		$("#level-selection-wrap").append(
			`<button class="level-selection-arrow-button" id="next-level-button"></button>`
		);
	} else {
		$("#level-selection-wrap").append(`<div class="level-selection-spacer"></div>`);
	}

	// highscore
	const highscore = localStorage.getItem(
		`elijah-cirioli-chess-sweeper-highscore-level-${levels[levelIndex].number}`
	);
	if (highscore === null) {
		$("#highscore").text("Personal best: ----");
	} else {
		$("#highscore").text(`Personal best: ${highscore}`);
	}

	// event listeners
	$("#start-game-button").off("click");
	$("#start-game-button").on("click", function () {
		startGame(levelIndex);
	});

	$("#previous-level-button").on("click", function () {
		generateLevelSelect(levelIndex - 1);
	});

	$("#next-level-button").on("click", function () {
		generateLevelSelect(levelIndex + 1);
	});
}

function showTutorial() {
	hideAllMenus();
	$("#icon-bar-wrap").css("visibility", "hidden");
	$("#board").hide();
	$("#blocker").hide();
	$("#piece-selection-wrap").hide();
	$("#tutorial-wrap").show();
}
