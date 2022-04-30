var context;
var shape = new Object();
var board;
var score;
var pac_color;
var start_time;
var time_elapsed;
var interval;
var turn = 'R' //'R': right, 'L': left, 'U': up, 'D': down

$(document).ready(function() {
	context = canvas.getContext("2d");
	Start();
	_setScreen('game')
});
function _setScreen(screen){
	if(screen==='welcome'){

	}
	else if(screen==='sign_in'){

	}
	else if(screen==='log_in'){
		
	}
	else if(screen==='settings'){
		
	}
	else if(screen==='game'){
		document.getElementById('game_screen').style.display='block'
	}
}

function Start() {
	_createBoard()
	_addListeners()
}
//generate the game board
//0:blank , 1:food , 2:pacman , 3: ghost, 4:wall
function _createBoard(){
	board = new Array();
	score = 0;
	pac_color = "yellow";
	var cnt = 100;//number of cells
	var food_remain = 50;
	var pacman_remain = 1;
	start_time = new Date();
	for (var i = 0; i < 10; i++) {
		board[i] = new Array();
		//put obstacles in (i=3,j=3) and (i=3,j=4) and (i=3,j=5), (i=6,j=1) and (i=6,j=2)
		for (var j = 0; j < 10; j++) {
			if (
				(i == 1 && j == 1) ||
				(i == 1 && j == 2) ||
				(i == 1 && j == 3) ||
				(i == 1 && j == 6) ||
				(i == 1 && j == 7) ||
				(i == 1 && j == 8) ||

				(i == 2 && j == 1) ||
				(i == 2 && j == 8) ||
				(i == 3 && j == 1) ||
				(i == 3 && j == 8) ||

				(i == 6 && j == 1) ||
				(i == 6 && j == 8) ||
				(i == 7 && j == 1) ||
				(i == 7 && j == 8) ||

				(i == 8 && j == 1) ||
				(i == 8 && j == 2) ||
				(i == 8 && j == 3) ||
				(i == 8 && j == 6) ||
				(i == 8 && j == 7) ||
				(i == 8 && j == 8) 
			) {
				board[i][j] = 4;
			} 
			else if(
				(i == 0 && j == 0) ||
				(i == 0 && j == 9) ||
				(i == 9 && j == 0) ||
				(i == 9 && j == 9) 
			){
				board[i][j] = 3;
			}else {
				var randomNum = Math.random();
				if (randomNum <= (1.0 * food_remain) / cnt) {
					food_remain--;
					board[i][j] = 1;
				} else if (randomNum < (1.0 * (pacman_remain + food_remain)) / cnt) {
					//bug??
					if (i <= 7 && i >= 2 && j <= 7 && j >= 2)
					{					
						shape.i = i;
						shape.j = j;
						pacman_remain--;
						board[i][j] = 2;
					}

				} else {
					board[i][j] = 0;
				}
				cnt--;
			}
		}
	}

	if (pacman_remain == 1){
		var emptyCell = findRandomEmptyCell(board);//2 dimentional number array
		while (emptyCell[0] > 7 || emptyCell[0] < 2 || emptyCell[1] > 7 || emptyCell[1] < 2){
			emptyCell = findRandomEmptyCell(board);
			console.log(emptyCell);
		}
		shape.i = emptyCell[0];
		shape.j = emptyCell[1];
		board[emptyCell[0]][emptyCell[1]] = 2;
		pacman_remain--;
	}

	//adding left food to the game
	while (food_remain > 0) {
		var emptyCell = findRandomEmptyCell(board);//2 dimentional number array
		board[emptyCell[0]][emptyCell[1]] = 1;
		food_remain--;
	}


}
//add key listeners
function _addListeners(){
	keysDown = {};
	addEventListener(
		"keydown",
		function(e) {
			keysDown[e.keyCode] = true;
		},
		false
	);
	addEventListener(
		"keyup",
		function(e) {
			keysDown[e.keyCode] = false;
		},
		false
	);
	interval = setInterval(UpdatePosition, 100);
}
//return a random 2 dim array
function findRandomEmptyCell(board) {
	
	var i = Math.floor(Math.random() * 9 + 1);
	var j = Math.floor(Math.random() * 9 + 1);
	while (board[i][j] != 0) {
		i = Math.floor(Math.random() * 9 + 1);
		j = Math.floor(Math.random() * 9 + 1);
	}
	return [i, j];
}
//convert keydown to number 
//1:up , 2:down , 3:left , 4:right
function GetKeyPressed() {
	if (keysDown[38]) {//up
		return 1;
	}
	if (keysDown[40]) {//down
		return 2;
	}
	if (keysDown[37]) {//left
		return 3;
	}
	if (keysDown[39]) {//right
		return 4;
	}
}

function Draw() {
	canvas.width = canvas.width; //clean board
	lblScore.value = score;
	lblTime.value = time_elapsed;
	for (var i = 0; i < 10; i++) {
		for (var j = 0; j < 10; j++) {
			var center = new Object();
			center.x = i * 60 + 30;
			center.y = j * 60 + 30;
			if (board[i][j] == 2) {
				_draw_pacman(center);
			} else if (board[i][j] == 3) {
				_draw_ghost(center);
			}else if (board[i][j] == 1) {
				context.beginPath();
				context.arc(center.x, center.y, 15, 0, 2 * Math.PI); // circle
				context.fillStyle = "black"; //color
				context.fill();
			} else if (board[i][j] == 4) {
				context.beginPath();
				context.rect(center.x - 30, center.y - 30, 60, 60);
				context.fillStyle = "grey"; //color
				context.fill();
			}
		}
	}
}

function UpdatePosition() {
	board[shape.i][shape.j] = 0;
	var x = GetKeyPressed();
	if (x == 1) {
		if (shape.j > 0 && board[shape.i][shape.j - 1] != 4) {
			shape.j--;
			turn = 'U';
		}
	}
	if (x == 2) {
		if (shape.j < 9 && board[shape.i][shape.j + 1] != 4) {
			shape.j++;
			turn = 'D';
		}
	}
	if (x == 3) {
		if (shape.i > 0 && board[shape.i - 1][shape.j] != 4) {
			shape.i--;
			turn = 'L';
		}
	}
	if (x == 4) {
		if (shape.i < 9 && board[shape.i + 1][shape.j] != 4) {
			shape.i++;
			turn = 'R';
		}
	}
	if (board[shape.i][shape.j] == 1) {
		score++;
	}
	board[shape.i][shape.j] = 2;//neww place
	var currentTime = new Date();
	time_elapsed = (currentTime - start_time) / 1000;
	if (score >= 20 && time_elapsed <= 10) {
		pac_color = "green";
	}
	if (score == 50) {
		Draw();
		window.clearInterval(interval);
		window.alert("Game completed");
	} else {
		Draw();
	}
}

//Draw functions:

function _draw_pacman(center){
	console.log(turn);

	if (turn == 'U'){	context.beginPath();
		context.arc(center.x, center.y, 30, 1.65 * Math.PI, 1.35 * Math.PI); // half circle
		context.lineTo(center.x, center.y);
		context.fillStyle = pac_color; //color
		context.fill();//pacman body
		context.beginPath();
		context.arc(center.x - 15, center.y - 5, 5, 0, 2 * Math.PI); // circle
		context.fillStyle = "black"; //color
		context.fill();//pacman eye

	}

	if (turn == 'D'){
		context.beginPath();
		context.arc(center.x, center.y, 30, 0.65 * Math.PI, 0.35 * Math.PI); // half circle
		context.lineTo(center.x, center.y);
		context.fillStyle = pac_color; //color
		context.fill();//pacman body
		context.beginPath();
		context.arc(center.x + 15, center.y + 5, 5, 0, 2 * Math.PI); // circle
		context.fillStyle = "black"; //color
		context.fill();//pacman eye
	}

	if (turn == 'L'){
		context.beginPath();
		context.arc(center.x, center.y, 30, 1.15 * Math.PI, 0.85 * Math.PI); // half circle
		context.lineTo(center.x, center.y);
		context.fillStyle = pac_color; //color
		context.fill();//pacman body
		context.beginPath();
		context.arc(center.x - 5, center.y - 15, 5, 0, 2 * Math.PI); // circle
		context.fillStyle = "black"; //color
		context.fill();//pacman eye
	}

	if (turn == 'R'){
		context.beginPath();
		context.arc(center.x, center.y, 30, 0.15 * Math.PI, 1.85 * Math.PI); // half circle
		context.lineTo(center.x, center.y);
		context.fillStyle = pac_color; //color
		context.fill();//pacman body
		context.beginPath();
		context.arc(center.x + 5, center.y - 15, 5, 0, 2 * Math.PI); // circle
		context.fillStyle = "black"; //color
		context.fill();//pacman eye
	}

}

function _draw_ghost(center){
	context.beginPath();
	context.arc(center.x, center.y, 15, 0, 2 * Math.PI); // circle
	context.fillStyle = "red"; //color
	context.fill();
}