class Piece {
	constructor(x, y, size, board) {
		this.x = x;
		this.y = y;
		this.image = "";
		this.size = size;
		this.board = board;
	}

	getMoves(board) {
		return [];
	}

	getLineMoves(moves, xDir, yDir, board) {
		for (let i = 1; true; i++) {
			const m = { x: this.x + i * xDir, y: this.y + i * yDir };
			if (this.canMove(m.x, m.y, board)) {
				moves.push(m);
			} else {
				return;
			}
		}
	}

	getMineCount(board) {
		return 0;
	}

	move(x, y) {
		this.x = x;
		this.y = y;
	}

	canMove(x, y, board) {
		if (x < 0 || x >= this.size) {
			return false;
		}
		if (y < 0 || y >= this.size) {
			return false;
		}
		return !board[y][x].isClicked();
	}

	getImage() {
		return this.image;
	}

	getType() {
		return "";
	}
}

class Pawn extends Piece {
	constructor(x, y, size, board) {
		super(x, y, size, board);
		this.image = "./images/pawn.png";
	}

	getMoves(board) {
		const moves = [];
		for (let xOffset = -1; xOffset <= 1; xOffset += 2) {
			for (let yOffset = -1; yOffset <= 1; yOffset += 2) {
				const m = { x: this.x + xOffset, y: this.y + yOffset };
				if (this.canMove(m.x, m.y, board)) {
					moves.push(m);
				}
			}
		}
		return moves;
	}

	getMineCount(board) {
		let count = 0;
		const moves = this.getMoves(board);
		for (const m of moves) {
			if (board[m.y][m.x].isMine()) {
				count++;
			}
		}
		return count;
	}

	getType() {
		return "pawn";
	}
}

class Knight extends Piece {
	constructor(x, y, size, board) {
		super(x, y, size, board);
		this.image = "./images/knight.png";
	}

	getMoves(board) {
		const moves = [];
		for (let xOffset = -2; xOffset <= 2; xOffset++) {
			for (let yOffset = -2; yOffset <= 2; yOffset++) {
				if (Math.abs(xOffset) + Math.abs(yOffset) === 3) {
					const m = { x: this.x + xOffset, y: this.y + yOffset };
					if (this.canMove(m.x, m.y, board)) {
						moves.push(m);
					}
				}
			}
		}
		return moves;
	}

	getMineCount(board) {
		let count = 0;
		const moves = this.getMoves(board);
		for (const m of moves) {
			if (board[m.y][m.x].isMine()) {
				count++;
			}
		}
		return count;
	}

	getType() {
		return "knight";
	}
}

class Bishop extends Piece {
	constructor(x, y, size, board) {
		super(x, y, size, board);
		this.image = "./images/bishop.png";
	}

	getMoves(board) {
		const moves = [];
		this.getLineMoves(moves, 1, 1, board);
		this.getLineMoves(moves, -1, 1, board);
		this.getLineMoves(moves, 1, -1, board);
		this.getLineMoves(moves, -1, -1, board);
		return moves;
	}

	getMineCount(board) {
		let count = 0;
		for (let xDir = -1; xDir <= 1; xDir += 2) {
			for (let yDir = -1; yDir <= 1; yDir += 2) {
				const moves = [];
				this.getLineMoves(moves, xDir, yDir, board);
				for (const m of moves) {
					if (board[m.y][m.x].isMine()) {
						count++;
						break;
					}
				}
			}
		}
		return count;
	}

	getType() {
		return "bishop";
	}
}

class Rook extends Piece {
	constructor(x, y, size, board) {
		super(x, y, size, board);
		this.image = "./images/rook.png";
	}

	getMoves(board) {
		const moves = [];
		this.getLineMoves(moves, 0, 1, board);
		this.getLineMoves(moves, 1, 0, board);
		this.getLineMoves(moves, 0, -1, board);
		this.getLineMoves(moves, -1, 0, board);
		return moves;
	}

	getMineCount(board) {
		let count = 0;
		const moveDirs = [
			[0, 1],
			[1, 0],
			[0, -1],
			[-1, 0],
		];
		for (const dir of moveDirs) {
			const moves = [];
			this.getLineMoves(moves, dir[0], dir[1], board);
			for (const m of moves) {
				if (board[m.y][m.x].isMine()) {
					count++;
					break;
				}
			}
		}
		return count;
	}

	getType() {
		return "rook";
	}
}

class King extends Piece {
	constructor(x, y, size, board) {
		super(x, y, size, board);
		this.image = "./images/king.png";
	}

	getMoves(board) {
		let moves = [];
		for (let xDir = -1; xDir <= 1; xDir++) {
			for (let yDir = -1; yDir <= 1; yDir++) {
				if (yDir === 0 && xDir === 0) continue;
				const m = { x: this.x + xDir, y: this.y + yDir };
				if (this.canMove(m.x, m.y, board)) {
					moves.push(m);
				}
			}
		}
		return moves;
	}

	getMineCount(board) {
		let count = 0;
		const moves = this.getMoves(board);
		for (const m of moves) {
			if (board[m.y][m.x].isMine()) {
				count++;
			}
		}
		return count;
	}

	getType() {
		return "king";
	}
}

class Queen extends Piece {
	constructor(x, y, size, board) {
		super(x, y, size, board);
		this.image = "./images/queen.png";
	}

	getMoves(board) {
		let moves = [];
		for (let xDir = -1; xDir <= 1; xDir++) {
			for (let yDir = -1; yDir <= 1; yDir++) {
				if (yDir === 0 && xDir === 0) continue;
				this.getLineMoves(moves, xDir, yDir, board);
			}
		}
		return moves;
	}

	getMineCount(board) {
		let count = 0;
		for (let xDir = -1; xDir <= 1; xDir++) {
			for (let yDir = -1; yDir <= 1; yDir++) {
				if (yDir === 0 && xDir === 0) continue;
				const moves = [];
				this.getLineMoves(moves, xDir, yDir, board);
				for (const m of moves) {
					if (board[m.y][m.x].isMine()) {
						count++;
						break;
					}
				}
			}
		}
		return count;
	}

	getType() {
		return "queen";
	}
}
