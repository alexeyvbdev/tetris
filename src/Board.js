import React, { Component, Fragment } from "react";
import "./App.css";
import shapes from "./data/shapes.js";

class Board extends Component {
	rowsSize = 22;
	columnsSize = 10;
	deltaDelay = 50;
	intervalID = null;
	delay = 1000;
	board = Array(this.rowsSize).fill().map(() => Array(this.columnsSize).fill(0));

	state = {
		board: this.board,
		newShape: false,
		index: 0,
		shape: null,
		startX: 0,
		startY: 0,
		width: 0,
		height: 0,
		rotation: 0,
		score: 0,
		delay: this.delay,
		isGame: true,
		counter: 0
	};

	initShape() {
		const index = Math.floor(Math.random() * 7);
		const shape = shapes[index].data[0];
		const width = shape[0].length;
		const height = shape.length;

		let startX = this.columnsSize / 2 - Math.floor(width / 2);
		if (width % 2 !== 0) {
			startX -= 1;
		}
		this.setState({
			index: index,
			shape: shape,
			startX: startX,
			startY: 0,
			width: width,
			height: height,
			newShape: true,
			rotation: 0
		});
	}
	
	reset() {
		window.location.reload();
	}

	renderSquare(i, j, counter) {
		let classFigure = "square ";
		if (j - this.state.startX >= 0 &&
			i - this.state.startY >= 0 &&
			j <= this.state.startX + this.state.width - 1 &&
			i <= this.state.startY + this.state.height - 1 &&
			typeof this.state.shape[i - this.state.startY][j - this.state.startX] !== "undefined" &&
			this.state.shape[i - this.state.startY][j - this.state.startX] > 0 &&
			this.state.board[i][j] === 0 && this.state.newShape) {
			classFigure += shapes[this.state.index].color;
		}
		else if (this.state.board[i][j] === 1) {
			classFigure += "filled-block";
		}
		return (
			<div key={counter} className={classFigure} data-col={j} data-row={i} />
		);
	}

	moveToLeft() {
		if (!this.state.isGame) {
			return false;
		}
		if (!this.haveLeftSquares()) {
			this.setState({
				startX: this.state.startX - 1
			});
		}
	}

	moveToRight() {
		if (!this.state.isGame) {
			return false;
		}
		if (!this.haveRightSquares()) {
			this.setState({
				startX: this.state.startX + 1
			});
		}
	}
	
	moveToDown() {
		if (!this.state.isGame) {
			return false;
		}
		if (!this.state.newShape) {
			return this.initShape();
		}

		if (this.haveBottomSquares()) {
			if (this.state.startY === 0 || this.state.startY === 1) {
				this.setState({
					isGame: false,
				});
				window.clearInterval(this.intervalID);
			} else {
				this.fillBoard();				
			}
		} else {
			this.setState({
				startY: this.state.startY + 1
			});
		}
	}

	getCenterPoint(shape) {
		return { x: this.state.startX + Math.floor(shape[0].length/2), y: this.state.startY + Math.floor(shape.length/2)};
	}

	rotate() {
		if (!this.state.isGame) {
			return false;
		}
		let r = (this.state.rotation >= 3) ? 0 : this.state.rotation + 1;
		let shape = shapes[this.state.index].data[r];
		let center = this.getCenterPoint(shape);
		if (center.x !== 0 && this.state.startX !== -1 && center.x !== this.columnsSize - 1 && this.state.startX + shape[0].length <= this.columnsSize) {
			this.setState({
				rotation: r,
				shape: shape,
				width: shape[0].length,
				height: shape.length,	
			});
		}
		if (this.haveBottomSquares()) {
			this.moveToDown();
		}
	}

	fillBoard() {
		this.state.shape.map((v1, row) =>
			v1.map((v2, col) => {
				if ((this.state.startY + row < this.rowsSize) && typeof this.board[this.state.startY + row][this.state.startX + col] !== 'undefined' && !this.board[this.state.startY + row][this.state.startX + col])
					this.board[this.state.startY + row][this.state.startX + col] = this.state.shape[row][col];
				return true;
			})
		);
		let delay = this.state.delay;
		this.setState({
			board: this.board,
			newShape: !this.haveBottomSquares(),
			counter: this.state.counter + 1,
			delay: (this.state.counter % 20 === 0 && delay > this.deltaDelay) ? delay - this.deltaDelay : delay
		});
		this.deleteRows();
	}

	deleteRow(row) {
		this.state.board.map((v1, i) =>
			v1.map((v2, j) => {
				this.board[i][j] = this.state.board[i][j];
				return true;
			})
		);
		let r = row;
		this.board.map((v1, i) => {
			if (i <= row) {
				v1.map((v2, j) => {
					this.board[r][j] = (r>0) ? this.board[r-1][j] : 0;
					return this.board[r][j];
				});
				r--;
			}
			return this.board;
		});
		this.setState({
			board: this.board,
			score: this.state.score + 1
		});
	}

	deleteRows() {
		this.state.board.map((v1, i) => {
			let line = true;
			v1.map((v2, j) => {
				if (!this.state.board[i][j]) {
					line = false;
				}
				return line;
			});
			if (line) this.deleteRow(i);
			return line;
		});
	}

	getBottomBound() {
		let bound = [];
		this.state.shape.map((v1, i) => {
			let y = this.state.height - i - 1;
			let cols = [];
			v1.map((v2, j) => {
				if (this.state.shape[y][j] === 1 && cols.indexOf(j) === -1) {
					bound.push({x: this.state.startX + j, y: this.state.startY + y});
					cols.push(j);
				}
				return j;
			});
			return cols;
		});
		return bound;
	}

	getLeftBound() {
		let bound = [];
		this.state.shape.map((v1, i) => {
			let rows = [];
			v1.map((v2, j) => {
				if (this.state.shape[i][j] === 1 && rows.indexOf(i) === -1) {
					bound.push({x: this.state.startX + j, y: this.state.startY + i});
					rows.push(i);
				}
				return i;
			});
			return rows;
		});
		return bound;
	}

	getRightBound() {
		let bound = [];
		this.state.shape.map((v1, i) => {
			let rows = [];
			v1.map((v2, j) => {
				let x = this.state.width - j - 1;
				if (this.state.shape[i][x] === 1 && rows.indexOf(i) === -1) {
					bound.push({x: this.state.startX + x, y: this.state.startY + i});
					rows.push(i);
				}
				return i;
			});
			return rows;
		});
		return bound;
	}

	haveBottomSquares() {
		let haveSquares = false;
		let bound = this.getBottomBound();
		bound.map((v1, i) => {
			if ((bound[i].y === this.rowsSize - 1) || (typeof this.state.board[bound[i].y+1][bound[i].x] !== 'undefined' && this.state.board[bound[i].y+1][bound[i].x] === 1)) {
				haveSquares = true;
			}
			return haveSquares;
		});
		return haveSquares;
	}
	
	haveLeftSquares() {
		let haveSquares = false;
		let bound = this.getLeftBound();
		bound.map((v1, i) => {
			if ((bound[i].x === 0) || (typeof this.state.board[bound[i].y][bound[i].x-1] !== 'undefined' && this.state.board[bound[i].y][bound[i].x-1] === 1)) {
				haveSquares = true;
			}
			return haveSquares;
		});
		return haveSquares;
	}

	haveRightSquares() {
		let haveSquares = false;
		let bound = this.getRightBound();
		bound.map((v1, i) => {
			if ((bound[i].x === this.columnsSize - 1) || (typeof this.state.board[bound[i].y][bound[i].x+1] !== 'undefined' && this.state.board[bound[i].y][bound[i].x+1] === 1)) {
				haveSquares = true;
			}
			return haveSquares;
		});
		return haveSquares;
	}

	handleKeyDown = e => {
		switch (e.key) {
			case "ArrowUp":
				this.rotate();
				break;
			case "ArrowLeft":
				this.moveToLeft();
				break;
			case "ArrowRight":
				this.moveToRight();
				break;
			case "ArrowDown":
				this.moveToDown();
				break;
			default:
				break;
		}
	}
	
	runGame = () => {
		if (!this.state.newShape) {
			return this.initShape();
		}
		this.moveToDown();
		if (this.haveBottomSquares()) {
			if (this.intervalID){
				clearInterval(this.intervalID);
			}

			this.intervalID = window.setInterval(() => {
				this.runGame();
			}, this.state.delay);
		}
	}

	componentDidMount() {
		this.refs.item.focus();
		this.intervalID = window.setInterval(() => {
			this.runGame();
		}, this.state.delay);
	}

	componentWillUnmount() {
		if (this.intervalID) {
			window.clearInterval(this.intervalID);
		}
	}

	render() {
		let counter = 0;
		const cells = this.state.board
		.map((v1, row) =>
			v1.map((v2, col) => {
				counter++;
				return this.renderSquare(row, col, counter);
			})
		);
		return (
			<Fragment>
				<div className="game-board-container">
					<div className="game-board">
						<div tabIndex="0" ref='item' onKeyDown={this.handleKeyDown}>{cells}</div>
					</div>
					<div className="score">
						<strong>Score: {this.state.score}</strong><br/>
						<button onClick={e => this.reset()}>Reset</button>
					</div>
					<div className="game-status" hidden={this.state.isGame}><strong>Game over!</strong></div>
				</div>
			</Fragment>
		);
	}
}

export default Board;