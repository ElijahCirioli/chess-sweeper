class Cell {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.piece;

		this.hasMineBool = false;
		this.hasFlagBool = false;
		this.marking = 0;

		this.generateElement();
		this.setupEventListeners();
	}

	generateElement() {
		let cellClass = "cell";
		if ((this.x + this.y) % 2 === 0) {
			cellClass += " light";
		}
		this.element = $(
			`<div class="${cellClass}"><img class="piece-image" /><p class="piece-mine-number"></p></div>`
		);
		$("#board").append(this.element);
	}

	setupEventListeners() {
		const self = this;

		this.element.on("mouseenter", function () {
			let moves;
			if (self.piece && self.piece !== "flag") {
				moves = getMoves(self.piece, self);
			} else if (selectedPiece) {
				moves = getMoves(selectedPiece, self);
			} else {
				$(".cell").removeClass("highlight");
				return;
			}

			highlightPossibleMoves(moves);
			$(".cell").removeClass("selected");
			self.element.addClass("selected");
		});

		this.element.on("mouseleave", function () {
			self.element.removeClass("selected");
		});

		this.element.on("click", function () {
			if (self.hasFlagBool) {
				// remove flag
				self.hasFlagBool = false;
				self.element.children(".piece-image").hide();
				self.element.removeClass("selected");
				pieceCounts.flag++;
				$("#piece-selection-flag").children(".piece-selection-counter").text(pieceCounts.flag);
			} else if (self.piece || !selectedPiece) {
				return;
			}

			if (selectedPiece === "safeNote" || selectedPiece === "flagNote") {
				self.mark();
			} else {
				self.placePiece();
			}
		});
	}

	placePiece() {
		if (mineCells.length === 0) {
			generateMines(this.x, this.y);
		}

		pieceCounts[selectedPiece]--;
		$(`#piece-selection-${selectedPiece}`)
			.children(".piece-selection-counter")
			.text(pieceCounts[selectedPiece]);

		this.element.children(".piece-image").attr("src", `images/${selectedPiece}.png`);
		this.element.children(".piece-image").show();
		if (selectedPiece === "flag") {
			this.hasFlagBool = true;
			this.element.children(".piece-image").css("cursor", "pointer");
			checkForWin();
		} else {
			this.piece = selectedPiece;
			updateAllMineCounts();
			checkForLoss();
		}
		selectedPiece = undefined;
		$(".piece-selection").removeClass("selected");
		$(".cell").css("cursor", "default");
		$("#preview-piece").hide();
	}

	mark() {
		console.log("a");
		if (selectedPiece === "safeNote") {
			this.element.children(".piece-image").attr("src", "images/check-outline.svg");
		} else {
			this.element.children(".piece-image").attr("src", "images/note-flag-outline.svg");
		}
		this.element.children(".piece-image").show();
	}

	updateMineCount() {
		if (!this.piece) {
			return;
		}

		const count = getMineCount(this);
		if (count === 0) {
			this.element.children(".piece-mine-number").hide();
		} else {
			this.element.children(".piece-mine-number").show();
			this.element.children(".piece-mine-number").text(count);
		}
	}

	highlight() {
		this.element.addClass("highlight");
	}

	hasMine() {
		return this.hasMineBool;
	}

	setMine() {
		this.hasMineBool = true;
	}

	hasPiece() {
		return this.piece != undefined;
	}

	getPiece() {
		return this.piece;
	}

	hasFlag() {
		return this.hasFlagBool;
	}

	getX() {
		return this.x;
	}

	getY() {
		return this.y;
	}
}
