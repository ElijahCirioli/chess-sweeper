class Cell {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.piece;

		this.hasMine = false;
		this.hasFlag = false;
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
			if (!selectedPiece) {
				return;
			}

			$(".cell").removeClass("inset-shadow");
			self.element.addClass("inset-shadow");
		});

		this.element.on("mouseleave", function () {
			self.element.removeClass("inset-shadow");
		});

		this.element.on("click", function () {
			if (selectedPiece && !self.piece) {
				self.placePiece();
			}
		});
	}

	placePiece() {
		pieceCounts[selectedPiece]--;
		$(`#piece-selection-${selectedPiece}`)
			.children(".piece-selection-counter")
			.text(pieceCounts[selectedPiece]);

		this.element.children(".piece-image").attr("src", `images/${selectedPiece}.png`);
		this.element.children(".piece-image").show();
		if (selectedPiece === "flag") {
			checkForWin();
		} else {
			this.piece = selectedPiece;
			updateAllMineCounts();
			checkForLoss();
		}
		selectedPiece = undefined;
		$(".piece-selection").removeClass("selected");
		$("#preview-piece").hide();
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
}
