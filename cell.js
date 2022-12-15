class Cell {
	constructor(x, y) {
		this.x = x; // the x coordinate of the cell
		this.y = y; // the y coordinate of the cell
		this.piece; // the type of piece placed on this cell

		this.hasMineBool = false; // whether this cell is a mine
		this.hasFlagBool = false; // whether this cell has a flag
		this.marking = 0; // what notes are on this cell (0 = none, 1 = safe, 2 = flag)

		this.generateElement();
		this.setupEventListeners();
	}

	generateElement() {
		let cellClass = "cell";
		if ((this.x + this.y) % 2 === 0) {
			cellClass += " light";
		}
		this.element = $(
			`<div class="${cellClass}"><div class="cell-mine-dot"></div><img class="piece-image" /><p class="piece-mine-number"></p></div>`
		);
		$("#board").append(this.element);
	}

	setupEventListeners() {
		const self = this;

		this.element.on("mouseenter dragover", function (e) {
			if (
				!self.piece &&
				!self.hasFlagBool &&
				selectedPiece &&
				selectedPiece !== "safeNote" &&
				selectedPiece !== "flagNote"
			) {
				// allow the piece to be dropped
				e.preventDefault();
			}

			let moves;
			if (self.piece && !self.hasFlagBool) {
				// moves of piece that is in this cell
				moves = getMoves(self.piece, self);
			} else if (selectedPiece) {
				// moves of the piece the user is holding
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
			$("#context-menu").hide();
			$(".cell").removeClass("menu-selected");
			self.element.removeClass("hint-highlight");

			if (self.hasFlagBool) {
				self.removeFlag();
			} else if (self.piece || !selectedPiece) {
				return;
			} else if (selectedPiece === "safeNote" || selectedPiece === "flagNote") {
				self.mark(selectedPiece);
			} else {
				self.placePiece();
			}
		});

		this.element.on("drop ", function (e) {
			e.preventDefault();

			$("#context-menu").hide();
			$(".cell").removeClass("menu-selected");
			self.element.removeClass("hint-highlight");

			// place if we can
			if (
				!self.hasFlagBool &&
				!self.piece &&
				selectedPiece &&
				selectedPiece !== "safeNote" &&
				selectedPiece !== "flagNote"
			) {
				self.placePiece();
			}
		});

		this.element.on("contextmenu", function (e) {
			if (self.piece) {
				return false;
			}

			// update the text
			$("#flag-context-button")
				.children(".context-button-text")
				.text(self.hasFlagBool ? "Unflag" : "Flag");
			if (pieceCounts.flag > 0 || self.hasFlagBool) {
				$("#flag-context-button").show();
			} else {
				$("#flag-context-button").hide();
			}
			$("#safe-note-context-button")
				.children(".context-button-text")
				.text(self.marking === 1 ? "Unmark safe" : "Mark safe");
			$("#flag-note-context-button")
				.children(".context-button-text")
				.text(self.marking === 2 ? "Unmark flag" : "Mark flag");

			// make it visible
			$("#context-menu").css("display", "flex");
			$(".cell").removeClass("menu-selected");
			self.element.addClass("menu-selected");

			// position on the board
			const boardSize = $("#board").width();
			const menuWidth = $("#context-menu").width();
			const menuHeight = $("#context-menu").height();
			const rect = $("#board")[0].getBoundingClientRect();

			let x = e.clientX - rect.left;
			if (x + menuHeight > boardSize) {
				x -= menuWidth;
			}
			let y = e.clientY - rect.top;
			if (y + menuHeight > boardSize) {
				y -= menuHeight;
			}

			$("#context-menu").css("left", `${x}px`);
			$("#context-menu").css("top", `${y}px`);

			self.setupContextMenuEventListeners();
			return false;
		});
	}

	setupContextMenuEventListeners() {
		const self = this;

		$("#flag-context-button").off("click");
		$("#flag-context-button").on("click", function () {
			if (self.hasFlagBool) {
				self.removeFlag();
			} else {
				if (mineCells.length === 0) {
					generateMines(-1, -1);
				}
				pieceCounts.flag--;
				$("#piece-selection-flag").children(".piece-selection-counter").text(pieceCounts.flag);
				self.element.children(".piece-image").attr("src", "images/flag.png");
				self.element.children(".piece-image").show();
				self.hasFlagBool = true;
				self.marking = 0;
				self.element.children(".piece-image").css("cursor", "pointer");

				// drag and drop events
				self.element.children(".piece-image").attr("draggable", "true");
				self.element.children(".piece-image").off("dragstart");
				self.element.children(".piece-image").on("dragstart", function () {
					selectedPiece = `flagMove:${self.x}:${self.y}`;
					$(".piece-selection").removeClass("selected");
					$(".cell").css("cursor", "default");
					$("#preview-piece").hide();
					$("#context-menu").hide();
					$(".cell").removeClass("menu-selected");
				});

				checkForWin();
			}
			$("#context-menu").hide();
			$(".cell").removeClass("menu-selected");
		});

		$("#flag-note-context-button").off("click");
		$("#flag-note-context-button").on("click", function () {
			if (self.hasFlagBool) {
				self.removeFlag();
			}
			self.element.removeClass("hint-highlight");
			self.mark("flagNote");
			$("#context-menu").hide();
			$(".cell").removeClass("menu-selected");
		});

		$("#safe-note-context-button").off("click");
		$("#safe-note-context-button").on("click", function () {
			if (self.hasFlagBool) {
				self.removeFlag();
			}
			self.mark("safeNote");
			$("#context-menu").hide();
			$(".cell").removeClass("menu-selected");
		});
	}

	placePiece() {
		// special case for dragging a flag from one cell to another
		if (selectedPiece && selectedPiece.startsWith("flagMove")) {
			const [fromX, fromY] = selectedPiece.split(":").slice(1);
			board[fromY][fromX].getElement().children(".piece-image").attr("draggable", "false");
			board[fromY][fromX].removeFlag();
			selectedPiece = "flag";
		}

		if (mineCells.length === 0) {
			if (selectedPiece === "flag") {
				generateMines(-1, -1);
			} else {
				// generate the mines avoiding this cell
				generateMines(this.x, this.y);
			}
		}

		// update piece count
		pieceCounts[selectedPiece]--;
		$(`#piece-selection-${selectedPiece}`)
			.children(".piece-selection-counter")
			.text(pieceCounts[selectedPiece]);
		if (pieceCounts[selectedPiece] === 0) {
			$(`#piece-selection-${selectedPiece}`)
				.children(".piece-selection-image")
				.attr("draggable", "false");
		}

		// create the piece image
		this.element.children(".piece-image").attr("src", `images/${selectedPiece}.png`);
		this.element.children(".piece-image").show();
		this.element.children(".piece-image").off("dragstart");
		if (selectedPiece === "flag") {
			// placing a flag
			this.hasFlagBool = true;
			this.element.children(".piece-image").css("cursor", "pointer");
			this.marking = 0;

			// adjust score for incorrect guesses
			if (!this.hasMineBool) {
				level.incorrectGuesses++;
			}

			// drag and drop events
			this.element.children(".piece-image").attr("draggable", "true");
			const self = this;
			this.element.children(".piece-image").on("dragstart", function () {
				selectedPiece = `flagMove:${self.x}:${self.y}`;
				$(".piece-selection").removeClass("selected");
				$(".cell").css("cursor", "default");
				$("#preview-piece").hide();
				$("#context-menu").hide();
				$(".cell").removeClass("menu-selected");
			});

			// see if the user has won
			checkForWin();
		} else {
			// placing a regular piece
			this.piece = selectedPiece;
			// see if the user has lost
			checkForLoss();
		}

		// update counts for all pieces
		updateAllMineCounts();

		this.marking = 0;

		// unselect piece tool
		selectedPiece = undefined;
		$(".piece-selection").removeClass("selected");

		$(".cell").css("cursor", "default");
		$("#preview-piece").hide();
	}

	removeFlag() {
		this.hasFlagBool = false;
		this.element.children(".piece-image").hide();
		this.element.removeClass("selected");
		pieceCounts.flag++;
		$("#piece-selection-flag").children(".piece-selection-counter").text(pieceCounts.flag);
		updateAllMineCounts();
	}

	mark(type) {
		if (type === "safeNote") {
			// safe marking
			if (this.marking === 1) {
				// unmark
				this.element.children(".piece-image").hide();
				this.marking = 0;
			} else {
				// mark
				this.element.children(".piece-image").attr("src", "images/check-outline.svg");
				this.element.children(".piece-image").show();
				this.marking = 1;
			}
		} else {
			// flag marking
			if (this.marking === 2) {
				// unmark
				this.element.children(".piece-image").hide();
				this.marking = 0;
			} else {
				// mark
				this.element.children(".piece-image").attr("src", "images/note-flag-outline.svg");
				this.element.children(".piece-image").show();
				this.marking = 2;
			}
		}
		this.element.children(".piece-image").css("cursor", "inherit");
	}

	updateMineCount() {
		if (!this.piece) {
			return;
		}

		const count = getMineCount(this);
		if (count === 0) {
			// hiden number if it's 0
			this.element.children(".piece-mine-number").hide();
		} else {
			this.element.children(".piece-mine-number").show();
			this.element.children(".piece-mine-number").text(count);
		}

		// remove hint highlight if this number has changed
		if (this.element.hasClass("hint-highlight")) {
			if (count === getFlagCount(this)) {
				this.element.removeClass("hint-highlight");
			}
		}
	}

	revealMine() {
		this.element.children(".cell-mine-dot").show();
		this.element.addClass("mine");
		this.element.removeClass("hint-highlight");
	}

	explode(radius) {
		this.revealMine();
		createExplosion(this.x, this.y, radius);
	}

	highlight() {
		this.element.addClass("highlight");
	}

	highlightHint() {
		this.element.addClass("hint-highlight");
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

	getElement() {
		return this.element;
	}

	getMarking() {
		return this.marking;
	}
}
