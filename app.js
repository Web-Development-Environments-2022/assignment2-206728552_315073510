var context;
var shape = new Object();
var special_food = {
	i:5,
	j:5,
	prev_val:0,
	value:50
};
var board;
var score;
var pac_color;
var start_time;
var time_elapsed;
var interval;
var interval_ghosts;
var interval_special_food;
var turn = 'R' //'R': right, 'L': left, 'U': up, 'D': down
//register
var registerForm={
	username:undefined,
	password:undefined,
	name:undefined,
	email:undefined,
	dateOfBirth:undefined,
}

var username;
var password
var name;
var email;
var dateOfBirth;
//log in
login={
	username:undefined,
	password:undefined
}
var users=[{username:'k',password:'k',email:'k@k.com'}]
var settings={
	upKey:38,
	downKey:40,
	leftKey:37,
	rightKey:39,
	numberOfFoods:50,
	foodColor5:'yellow',
	foodColor15:'blue',
	foodColor25:'green',
	gameTime:60,
	numberOfMonsters:4
}

$(document).ready(function() {
	context = canvas.getContext("2d");
	Start();
	_setScreen('game')
});
function Start() {
	ghosts = [];
	ghosts[0] = {i:0, j:0, prev_val:0 };
	ghosts[1] = {i:0, j:9, prev_val:0 };
	ghosts[2] = {i:9, j:0, prev_val:0 };
	ghosts[3] = {i:9, j:9, prev_val:0 };
	ghosts = ghosts.slice(-settings.numberOfMonsters);
	_createBoard()
	_addListeners()
}
//generate the game board
//0:blank , 1: , 2:pacman , 3: ghost , 4:wall , 5:food-5 , 6: food-15 , 7:food-25 , 8:random food - 50
function _createBoard(){
	board = new Array();
	score = 0;
	pac_color = "yellow";
	food_remain = settings.numberOfFoods;
	var cnt = 100;//number of cells
	var pacman_remain = 1;
	var special_food_remain = 1;
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
				(i == ghosts[0].i && j == ghosts[0].j) ||
				(i == ghosts[1].i && j == ghosts[1].j) ||
				(i == ghosts[2].i && j == ghosts[2].j) ||
				(i == ghosts[3].i && j == ghosts[3].j) 
			){
				board[i][j] = 3;
			}else if(i == 5 && j == 5){
				board[i][j] = 8;
			}else {
				var randomNum = Math.random();
				if (randomNum <= (1.0 * food_remain) / cnt) {
					food_remain--;
					var randomFood = Math.random();
					if (randomFood <= 0.6){
						board[i][j] = 5;
					}else if(randomFood <= 0.9){
						board[i][j] = 6;
					}else{
						board[i][j] = 7;
					}
					
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
	interval_ghosts = setInterval(_UpdateGhosts, 1000);
	interval_special_food = setInterval(_UpdateSpecialFood, 250);
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
	if (keysDown[settings.upKey]) {//up
		return 1;
	}
	if (keysDown[settings.downKey]) {//down
		return 2;
	}
	if (keysDown[settings.leftKey]) {//left
		return 3;
	}
	if (keysDown[settings.rightKey]) {//right
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

			} else if (board[i][j] == 4) {
				context.beginPath();
				context.rect(center.x - 30, center.y - 30, 60, 60);
				context.fillStyle = "grey"; //color
				context.fill();
			}else if (board[i][j] == 5) {
				context.beginPath();
				context.arc(center.x, center.y, 15, 0, 2 * Math.PI); // circle
				context.fillStyle = settings.foodColor5; //color
				context.fill();
			}else if (board[i][j] == 6) {
				context.beginPath();
				context.arc(center.x, center.y, 15, 0, 2 * Math.PI); // circle
				context.fillStyle = settings.foodColor15; //color
				context.fill();
			}else if (board[i][j] == 7) {
				context.beginPath();
				context.arc(center.x, center.y, 15, 0, 2 * Math.PI); // circle
				context.fillStyle = settings.foodColor25; //color
				context.fill();
			}else if (board[i][j] == 8 && special_food.value == 50) {
				context.beginPath();
				context.arc(center.x, center.y, 15, 0, 2 * Math.PI); // circle
				context.fillStyle = "black"; //color
				context.fill();
			}
		}
	}
}

function UpdatePosition() {
	if (lblTime.value == settings.gameTime){
		_endgame();
	}
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
	if (board[shape.i][shape.j] == 5) {
		score+=5;
	}else if (board[shape.i][shape.j] == 6) {
		score+=15;
	}else if (board[shape.i][shape.j] == 7) {
		score+=25;
	}
	else if (board[shape.i][shape.j] == 8) {
		//alert("amazing");
		special_food.value=0;
		score+=50;
		window.clearInterval(interval_special_food);
	}
	board[shape.i][shape.j] = 2;//neww place
	var currentTime = new Date();
	time_elapsed = settings.gameTime - (currentTime - start_time) / 1000;
	if (score >= 20 && time_elapsed <= 10) {
		pac_color = "green";
	}
	if (score == 1000) {
		Draw();
		window.clearInterval(interval);
		window.clearInterval(interval_ghosts);
		window.clearInterval(interval_special_food);
		window.alert("Game completed");
	} else {
		Draw();
	}
}

function _UpdateGhosts(){
	// ghost = ghosts[0];
	// if(board[ghost.i+1][ghost.j] == 2){
	// 	_eat_pacmen();
	// }
	// val = ghost.prev_val;
	// ghost.prev_val = board[ghost.i+1][ghost.j]
	// ghost.i ++;
	// board[ghost.i][ghost.j] = 3;
	// board[ghost.i-1][ghost.j] = val;
}

function _UpdateSpecialFood(){
	var random = Math.random();
	if (random <= 0.25){
		if (special_food.i+1 <= 9 && board[special_food.i+1][special_food.j] != 4 && board[special_food.i+1][special_food.j] != 2){
			val = special_food.prev_val;
			special_food.prev_val = board[special_food.i+1][special_food.j]
			special_food.i++;
			board[special_food.i][special_food.j] = 8;
			board[special_food.i-1][special_food.j] = val;
		}
	}else if (random <= 0.5){
		if (special_food.i-1 >=0 && board[special_food.i-1][special_food.j] != 4 && board[special_food.i-1][special_food.j] != 2){
			val = special_food.prev_val;
			special_food.prev_val = board[special_food.i-1][special_food.j]
			special_food.i--;
			board[special_food.i][special_food.j] = 8;
			board[special_food.i+1][special_food.j] = val;
		}
	}else if (random <= 0.75){
		if (special_food.j-1 >=0 && board[special_food.i][special_food.j-1] != 4 && board[special_food.i][special_food.j-1] != 2){
			val = special_food.prev_val;
			special_food.prev_val = board[special_food.i][special_food.j-1]
			special_food.j--;
			board[special_food.i][special_food.j] = 8;
			board[special_food.i][special_food.j+1] = val;
		}
	}else{
		if (special_food.j+1 <= 9 && board[special_food.i][special_food.j+1] != 4 && board[special_food.i][special_food.j+1] != 2){
			val = special_food.prev_val;
			special_food.prev_val = board[special_food.i][special_food.j+1]
			special_food.j++;
			board[special_food.i][special_food.j] = 8;
			board[special_food.i][special_food.j-1] = val;
		}
	}

}

//Draw functions:

function _draw_pacman(center){
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

function _eat_pacmen(){
	alert("OH NO!");
}

function _setScreen(screen){
	_displayNoneAllScreens()
	if(screen==='welcome'){
		_displayScreen('welcome_screen')
	}
	else if(screen==='register'){
		_displayScreen('register_screen')
	}
	else if(screen==='log_in'){
		_displayScreen('log_in_screen')
	
	}
	else if(screen==='settings'){
		_displayScreen('settings_screen')
	}
	else if(screen==='game'){
		_displayScreen('game_screen')
		
	}

}
function _displayScreen(screen){
	document.getElementById(screen).style.display='flex'
	document.getElementById(screen).style.justifyContent='center'
}
function _displayNoneAllScreens(){
	document.getElementById('welcome_screen').style.display='none'
	document.getElementById('register_screen').style.display='none'
	document.getElementById('log_in_screen').style.display='none'
	document.getElementById('settings_screen').style.display='none'

	document.getElementById('game_screen').style.display='none'

}
function _openAboutDialog(){

	$( function() {
		// $( "#about_dialog" ).style.display='flex';
		$( "#about_dialog" ).dialog();
	  } );
}

function _onRegisterSubmit(form) {

	if(!_isAllRegisterFieldsFilled()){
		alert('All fields must be filled');
		return false;
	}
	if(!_isRegisterPasswordValid()){
		alert('Password is not valid');
		return false;
	}
	if(!_isRegisterNameValid()){
		alert('First or last name is not valid');
		return false;
	}
	if(!_isRegisterEmailValid()){
		alert('Email is not valid');
		return false;
	}

	registerForm.username =$('#reg_username').val();
	registerForm.password = $('#reg_password').val(); 
	registerForm.name = $('#reg_name').val();
	registerForm.email = $('#reg_email').val();
	registerForm.dateOfBirth = $('#reg_date').val();
	users.push({username:registerForm.username,password:registerForm.password})
	alert('User has been registered successfuly')
	return false;
  }
  function _isAllRegisterFieldsFilled(){
	return $('#reg_username').val() && $('#reg_password').val()&&
	 $('#reg_name').val()&& $('#reg_email').val()&& $('#reg_date').val();
  }
  function _isRegisterPasswordValid(){
	  let password=$('#reg_password').val();
	return /\d/.test(password) && password.length>=6 && /[a-z]/i.test(password);
	 
  }
  function _isRegisterNameValid(){
	let name=$('#reg_name').val();
  return !/\d/.test(password) ;
   
}
function _isRegisterEmailValid(){
	let email=$('#reg_email').val();
	var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  return regex.test(email);
   
}
function _logIn(f){
	login.username =$('#login_username').val();
	login.password = $('#login_password').val(); 
	
	if(users.map(u=>u.username).includes(login.username)&&
		users.map(u=>u.password).includes(login.password)){
			alert('Logged In');
			_setScreen('settings');
		}
	else{
		alert('incorrect password or username')
	}
	return false
}
function goUpDef(){
	$('#go-up-btn').html('press any key to define up key')
	// $('#go-up-btn').disable()
	$('#go-up-btn').css("background-color",'#B22727');
	document.addEventListener('keydown', function(event) {
		$('#go-up-btn').html('Go Up')
		$('#go-up-btn').css("background-color",'#028498');
	});
}

function _endgame(){
	alert("game is ended");
}

