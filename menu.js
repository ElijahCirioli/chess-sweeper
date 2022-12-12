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
	});

	$("#hint-reveal-button").on("click", function () {
		hideAllMenus();
		if (mineCells.length === 0) {
			generateMines(-1, -1);
		}
		for (const cell of mineCells) {
			if (!cell.hasFlag() && !cell.getElement().hasClass("mine")) {
				cell.revealMine();
				return;
			}
		}
	});

	// game over menus
	$("#play-again-button").on("click", function () {
		window.location.reload();
	});
}

function hideAllMenus() {
	$("#menu-wrap").hide();
	$(".menu").hide();
	$("#lose-menu").addClass("game-over-menu-hidden");
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
	$("#lose-menu").removeClass("game-over-menu-hidden");
}
