var context;
var shape = new Object();
var board;
var score;
var pac_color;
var start_time;
var time_elapsed;
var interval;
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
var serttings={
	upKey:38,
	downKey:40,
	leftKey:undefined,
}


$(document).ready(function() {
	context = canvas.getContext("2d");
	Start();
	_setScreen('settings')
});
function Start() {
	_createBoard()
	_addListeners()
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
				context.beginPath();
				context.arc(center.x, center.y, 30, 0.15 * Math.PI, 1.85 * Math.PI); // half circle
				context.lineTo(center.x, center.y);
				context.fillStyle = pac_color; //color
				context.fill();//pacman body
				context.beginPath();
				context.arc(center.x + 5, center.y - 15, 5, 0, 2 * Math.PI); // circle
				context.fillStyle = "black"; //color
				context.fill();//pacman eye
			} else if (board[i][j] == 1) {
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
		}
	}
	if (x == 2) {
		if (shape.j < 9 && board[shape.i][shape.j + 1] != 4) {
			shape.j++;
		}
	}
	if (x == 3) {
		if (shape.i > 0 && board[shape.i - 1][shape.j] != 4) {
			shape.i--;
		}
	}
	if (x == 4) {
		if (shape.i < 9 && board[shape.i + 1][shape.j] != 4) {
			shape.i++;
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
		window.clearInterval(interval);
		window.alert("Game completed");
	} else {
		Draw();
	}
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
//generate the game board
//0:blank , 1:food , 2:pacman , 3: , 4:wall
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
				(i == 3 && j == 3) ||
				(i == 3 && j == 4) ||
				(i == 3 && j == 5) ||
				(i == 6 && j == 1) ||
				(i == 6 && j == 2)
			) {
				board[i][j] = 4;
			} else {
				var randomNum = Math.random();
				if (randomNum <= (1.0 * food_remain) / cnt) {
					food_remain--;
					board[i][j] = 1;
				} else if (randomNum < (1.0 * (pacman_remain + food_remain)) / cnt) {
					//bug??
					shape.i = i;
					shape.j = j;
					pacman_remain--;
					board[i][j] = 2;
				} else {
					board[i][j] = 0;
				}
				cnt--;
			}
		}
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