import React, { Component } from "react";
import Board from "./Board";

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			active: false
		};
	}

	render() {
		return (
			<div className="game">
					<Board />				
			</div>
		);
	}
}

export default App;