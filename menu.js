function setupMenuEventListeners() {
	$(".menu-close-button").on("click", function () {
		hideAllMenus();
	});

	$("#menu-wrap").on("click", function (e) {
		if (e.target === e.currentTarget) {
			hideAllMenus();
		}
	});

	// hint menu
	$("#hint-button").on("click", function () {
		if ($("#blocker").css("display") !== "none") {
			return;
		}
		$("#menu-wrap").show();
		$(".menu").hide();
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
}

function hideAllMenus() {
	$("#menu-wrap").hide();
	$(".menu").hide();
}
