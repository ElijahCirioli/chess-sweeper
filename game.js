let board;
let pieceCounts;
let selectedPiece;

function generateBoard(size) {
	$("#board").empty();
	const divSize = $("#board").width();
	const cellSize = divSize / size;
	board = [];
	for (let y = 0; y < size; y++) {
		let row = [];
		for (let x = 0; x < size; x++) {
			row.push(new Cell(x, y, cellSize));
		}
		board.push(row);
	}
	$("#board").css("grid-template-columns", `repeat(${size}, ${cellSize}px)`);
	$("#board").css("grid-template-rows", `repeat(${size}, ${cellSize}px)`);
}

window.onload = () => {
	generateBoard(10);
};
