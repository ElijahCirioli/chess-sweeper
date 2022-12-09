class Cell {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.mine = false;
		this.flagged = false;
		this.piece;
	}

	isMine() {
		return this.mine;
	}

	isFlagged() {
		return this.flagged;
	}

	isClicked() {
		return this.piece !== undefined;
	}

	setMine(status) {
		this.mine = status;
	}

	setFlag(status) {
		this.flagged = status;
	}

	click(piece) {
		this.piece = piece;
	}

	getMineCount(board) {
		if (!this.piece) {
			return 0;
		}
		return this.piece.getMineCount(board);
	}
}
