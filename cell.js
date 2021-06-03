class Cell {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.mine = false;
		this.flagged = false;
		this.clicked = false;
	}

	isMine() {
		return this.mine;
	}

	isFlagged() {
		return this.flagged;
	}

	isClicked() {
		return this.clicked();
	}

	setMine(status) {
		this.mine = status;
	}

	flag() {}

	click() {}
}
