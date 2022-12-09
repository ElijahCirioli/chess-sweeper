class Cell {
	constructor(x, y, size) {
		this.x = x;
		this.y = y;
		this.size = size;

		this.hasMine = false;
		this.hasFlag = false;
		this.hasPiece = false;
		this.marking = 0;

		this.generateElement();
	}

	generateElement() {
		let cellClass = "cell";
		if ((this.x + this.y) % 2 === 0) {
			cellClass += " light";
		}
		$("#board").append(`<div class="${cellClass}"></div>`);
	}
}
