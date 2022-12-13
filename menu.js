function setupMenuEventListeners() {
	$(".menu-close-button").on("click", function () {
		hideAllMenus();
	});

	$("#menu-wrap").on("click", function (e) {
		if (e.target === e.currentTarget && $("#hint-menu").css("display") !== "none") {
			hideAllMenus();
		}
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
		scoreData.hintMultiplier *= 0.9;
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
		scoreData.hintMultiplier *= 0.9;
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
		scoreData.hintMultiplier *= 0.75;
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
		scoreData.hintMultiplier *= 0.75;
	});

	// game over menus
	$(".play-again-button").on("click", function () {
		window.location.reload();
	});
}

function hideAllMenus() {
	$("#menu-wrap").hide();
	$(".menu").hide();
	$(".game-over-menu").addClass("game-over-menu-hidden");
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

	let score = scoreData.baseScore;
	$("#score-wrap").append(`<div class="score-row"><p>Level ${levelNum} complete:</p><p>${score}</p></div>`);

	let timeBonus = 0;
	if (elapsedTime < scoreData.maximumMinutes * 60) {
		timeBonus = Math.ceil((scoreData.maximumMinutes * 60 - elapsedTime) * 5);
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

	let guessingPenalty = Math.min(100 * scoreData.incorrectGuesses, score);
	$("#score-wrap").append(
		`<div class="score-row"><p>Guessing penalty:</p><p>-${guessingPenalty}</p></div>`
	);
	score -= guessingPenalty;

	if (scoreData.hintMultiplier !== 1) {
		scoreData.hintMultiplier = Math.round(Math.max(0.1, scoreData.hintMultiplier) * 100) / 100;
		score = Math.round(score * scoreData.hintMultiplier);
		$("#score-wrap").append(
			`<div class="score-row"><p>Hint penalty:</p><p>x${scoreData.hintMultiplier.toPrecision(
				2
			)}</p></div>`
		);
	}

	$("#score-wrap").append(`<div class="score-row"><p><b>Total:</b></p><p><b>${score}</b></p></div>`);

	const highscoreKey = `elijah-cirioli-chess-sweeper-highscore-level-${levelNum}`;
	const highscore = localStorage.getItem(highscoreKey);
	if (highscore === "null" || score > parseInt(highscore)) {
		localStorage.setItem(highscoreKey, score);
		$("#score-wrap").append(`<p id="new-highscore-message">New highscore</p>`);
	}
}
