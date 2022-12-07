class Board {
	constructor(size, numMines, pieces) {
		this.size = size;
		this.numMines = numMines;
		this.pieces = pieces;
		this.pieces["flag"] = numMines;
		this.board = [];
		this.mines = [];

		this.generateBoardData();
		this.generateBoardHtml();
		this.setupPieces();
	}

	generateBoardHtml() {
		$("#board").empty();
		for (let y = 0; y < this.size; y++) {
			for (let x = 0; x < this.size; x++) {
				let cellClass = "cell";
				if ((x + y) % 2 === 0) {
					cellClass += " light";
				}
				$("#board").append(`<div id="${x}-${y}" class="${cellClass}"></div>`);
			}
		}
		$("#board").append(`<img class="piece-img" id="preview-piece" />`);
		$("#board").css("grid-template-columns", `repeat(${this.size}, ${Math.round(400 / this.size)}px)`);
		$("#board").css("grid-template-rows", `repeat(${this.size}, ${Math.round(400 / this.size)}px)`);
		$("#board").on("mouseleave", function (e) {
			$(".cell").removeClass("highlight");
			$("#preview-piece").hide();
		});
	}

	generateBoardData() {
		//define board structure
		this.board = [];
		for (let y = 0; y < this.size; y++) {
			const row = [];
			for (let x = 0; x < this.size; x++) {
				row.push(new Cell(x, y));
			}
			this.board.push(row);
		}

		//add mines
		for (let i = 0; i < this.numMines; i++) {
			let x, y;

			do {
				x = Math.floor(Math.random() * this.size);
				y = Math.floor(Math.random() * this.size);
			} while (this.board[y][x].isMine());

			this.mines.push(this.board[y][x]);
			this.board[y][x].setMine(true);
		}
	}

	setupPieces() {
		for (const p in this.pieces) {
			$(`#${p}`).children(".piece-counter").text(this.pieces[p]);
		}
		$(".piece-img").off("click");
		const self = this;
		$(".piece-img").on("click", function () {
			if ($(this).hasClass("selected-piece")) {
				self.ungrabPiece();
			} else {
				self.ungrabPiece();
				const type = $(this).parent().attr("id");
				if (self.pieces[type] == 0) {
					return;
				}
				$(this).addClass("selected-piece");
				self.grabPiece(type);
			}
		});
	}

	grabPiece(type) {
		let obj;
		switch (type) {
			case "pawn":
				obj = new Pawn(0, 0, this.size, this.board);
				break;
			case "knight":
				obj = new Knight(0, 0, this.size, this.board);
				break;
			case "rook":
				obj = new Rook(0, 0, this.size, this.board);
				break;
			case "bishop":
				obj = new Bishop(0, 0, this.size, this.board);
				break;
			case "king":
				obj = new King(0, 0, this.size, this.board);
				break;
			case "queen":
				obj = new Queen(0, 0, this.size, this.board);
				break;
		}

		$(".cell").off("mouseover");
		const self = this;
		$(".cell").on("mouseover", function () {
			const coords = $(this).attr("id").split("-");
			const x = parseInt(coords[0]);
			const y = parseInt(coords[1]);

			if (self.board[y][x].isClicked()) {
				self.highlightMoves(self.board[y][x].piece, x, y);
				$("#preview-piece").show();
				if (obj) {
					$("#preview-piece").attr("src", obj.getImage());
				} else if (type === "flag") {
					$("#preview-piece").attr("src", "images/flag.png");
				}
				$("#preview-piece").css("left", x * 40 + 1 + "px");
				$("#preview-piece").css("top", y * 40 + 1 + "px");
			} else if (obj) {
				self.highlightMoves(obj, x, y);
				$("#preview-piece").show();
				$("#preview-piece").attr("src", obj.getImage());

				$("#preview-piece").css("left", x * 40 + 1 + "px");
				$("#preview-piece").css("top", y * 40 + 1 + "px");
			} else if (type === "flag") {
				$(".cell").removeClass("highlight");
				$("#preview-piece").show();
				$("#preview-piece").attr("src", "images/flag.png");
				$("#preview-piece").css("left", x * 40 + 1 + "px");
				$("#preview-piece").css("top", y * 40 + 1 + "px");
			} else {
				$("#preview-piece").hide();
			}
		});
		$(".cell").off("click");
		$(".cell").on("click", function () {
			const coords = $(this).attr("id").split("-");
			const x = parseInt(coords[0]);
			const y = parseInt(coords[1]);

			if (type === "flag") {
				self.placeFlag(x, y);
			} else {
				self.placePiece(obj, x, y);
			}
		});
	}

	ungrabPiece() {
		$("#preview-piece").hide();
		$(".cell").off("click mouseover");

		const self = this;
		$(".cell").on("mouseover", function () {
			const coords = $(this).attr("id").split("-");
			const x = parseInt(coords[0]);
			const y = parseInt(coords[1]);

			if (self.board[y][x].isClicked()) {
				self.highlightMoves(self.board[y][x].piece, x, y);
			} else {
				$(".cell").removeClass("highlight");
			}
		});
		$(".cell").removeClass("highlight");
		$(".piece-img").css("background", "none");
		$(".piece-img").removeClass("selected-piece");
	}

	highlightMoves(piece, x, y) {
		$(".cell").removeClass("highlight");
		piece.move(x, y);

		if (this.board[y][x].isFlagged()) {
			return;
		}
		const moves = piece.getMoves(this.board);
		for (const m of moves) {
			$(`#${m.x}-${m.y}`).addClass("highlight");
		}
	}

	placePiece(piece, x, y) {
		const cell = this.board[y][x];
		if (cell.isFlagged()) {
			return;
		}

		if (cell.isMine()) {
			this.gameOver();
		} else if (!cell.isClicked()) {
			cell.click(piece);
			const pieceImage = $(`<img class="piece-img cell-piece" />`);
			pieceImage.attr("src", piece.getImage());
			pieceImage.css("left", x * 40 + 1 + "px");
			pieceImage.css("top", y * 40 + 1 + "px");
			$("#board").append(pieceImage);

			const type = piece.getType();
			this.pieces[type]--;
			$(`#${type}`).children(".piece-counter").text(this.pieces[type]);

			this.ungrabPiece();
			this.displayMineCounts();
		}
	}

	placeFlag(x, y) {
		const cell = this.board[y][x];
		if (cell.isFlagged()) {
			this.pieces.flag++;
			cell.setFlag(false);
			$(`#flag-${x}-${y}`).remove();
		} else if (!cell.isClicked()) {
			this.pieces.flag--;
			cell.setFlag(true);
			const flagImage = $(
				`<img id="flag-${x}-${y}" class="piece-img cell-piece" src="images/flag.png"/>`
			);
			flagImage.css("left", x * 40 + 1 + "px");
			flagImage.css("top", y * 40 + 1 + "px");
			$("#board").append(flagImage);

			const self = this;
			$(`#${x}-${y}`).off("mouseup");
			$(`#${x}-${y}`).on("mouseup", function () {
				if ($("#flag").children(".piece-img").hasClass("selected-piece")) {
					return;
				}
				cell.setFlag(false);
				flagImage.remove();
				self.pieces.flag++;
				$("#flag").children(".piece-counter").text(self.pieces.flag);
				$(`#${x}-${y}`).off("mouseup");
			});
		}

		$("#flag").children(".piece-counter").text(this.pieces.flag);
		this.ungrabPiece();
		this.checkForWin();
	}

	displayMineCounts() {
		$(".mine-count").remove();
		for (let y = 0; y < this.board.length; y++) {
			for (let x = 0; x < this.board[y].length; x++) {
				const count = this.board[y][x].getMineCount(this.board);
				if (count === 0) {
					continue;
				}

				const text = $(`<p class="mine-count">${count}</p>`);
				text.css("left", x * 40 + 1 + "px");
				text.css("top", y * 40 + 1 + "px");
				$("#board").append(text);
			}
		}
	}

	checkForWin() {
		if (this.pieces.flag > 0) {
			return;
		}

		for (const m of this.mines) {
			if (!m.isFlagged()) {
				return;
			}
		}

		this.revealMines(() => {
			alert("You win!");
			location.reload();
		});
	}

	gameOver() {
		this.revealMines(() => {
			alert("You lose.");
			location.reload();
		});
	}

	revealMines(callback) {
		if (this.mines.length === 0) {
			callback();
			return;
		}

		const mine = this.mines.pop();
		$(`#${mine.x}-${mine.y}`).addClass("mine");

		setTimeout(() => {
			this.revealMines(callback);
		}, 40);
	}
}
