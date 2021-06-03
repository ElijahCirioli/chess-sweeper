class Board {
	constructor(size, numMines, pieces) {
		this.size = size;
		this.numMines = numMines;
		this.pieces = pieces;
		this.board = [];
		this.mines = [];

		this.generateBoardData();
		this.generateBoardHtml();
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
		$("#board").css("grid-template-columns", `repeat(${this.size}, ${Math.round(400 / this.size)}px)`);
		$("#board").css("grid-template-rows", `repeat(${this.size}, ${Math.round(400 / this.size)}px)`);
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
			let x = Math.floor(Math.random() * this.size);
			let y = Math.floor(Math.random() * this.size);

			while (this.board[y][x].isMine()) {
				x = Math.floor(Math.random() * this.size);
				y = Math.floor(Math.random() * this.size);
			}

			this.mines.push(this.board[y][x]);
			this.board[y][x].setMine(true);
		}
	}
}
