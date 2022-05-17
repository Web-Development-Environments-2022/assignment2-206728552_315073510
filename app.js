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
var lives;
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
//settings
buttonSelected=false
var settings={
	upKey:38,
	downKey:40,
	leftKey:37,
	rightKey:39,
	numberOfFoods:50,
	foodColor5:'blue',
	foodColor15:'yellow',
	foodColor25:'green',
	gameTime:60,
	numberOfghosts:4
}
afterClickColor ='#2A2550'
const image_ghost = document.getElementById('source');


$(document).ready(function() {
	context = canvas.getContext("2d");
	Start();
	_setScreen('game')
});
function Start() {
	ghosts = [];
	ghosts[0] = {i:0, j:0, prev_val:0, last_move:'R', walk_len:0, stuck:true};
	ghosts[1] = {i:0, j:9, prev_val:0, last_move:'L', walk_len:0, stuck:true};
	ghosts[2] = {i:9, j:0, prev_val:0, last_move:'R', walk_len:0, stuck:true};
	ghosts[3] = {i:9, j:9, prev_val:0, last_move:'L', walk_len:0, stuck:true};
	ghosts = ghosts.slice(-settings.numberOfghosts);
	_createBoard()
	_addListeners()
}
//generate the game board
//0:blank , 1: , 2:pacman , 3: ghost , 4:wall , 5:food-5 , 6: food-15 , 7:food-25 , 8:random food - 50
function _createBoard(){
	board = new Array();
	score = 0;
	lives = 5;
	pac_color = "yellow";
	food_remain = settings.numberOfFoods;
	food_eaten = 0;
	var cnt = 100;//number of cells
	var pacman_remain = 1;
	var special_food_remain = 1;
	start_time = new Date();
	for (var i = 0; i < 10; i++) {
		board[i] = new Array();
		//put obstacles in (i=3,j=3) and (i=3,j=4) and (i=3,j=5), (i=6,j=1) and (i=6,j=2)
		for (var j = 0; j < 10; j++) {
			for (let index = 0; index < ghosts.length; index++) {
				if(i == ghosts[index].i && j == ghosts[index].j){
					board[i][j] = 3;
				}
			}			
			if (
				(i == 3 && j == 2) ||
				(i == 3 && j == 3) ||
				(i == 2 && j == 3) ||

				(i == 6 && j == 2) ||
				(i == 6 && j == 3) ||
				(i == 7 && j == 3) ||

				(i == 2 && j == 7) ||
				(i == 3 && j == 7) ||
				(i == 4 && j == 7) ||
				(i == 5 && j == 7) ||
				(i == 6 && j == 7) ||
				(i == 7 && j == 7) 

			) {
				board[i][j] = 4;
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
		//console.log(food_remain);
		var emptyCell = findRandomEmptyCell(board);//2 dimentional number array
		board[emptyCell[0]][emptyCell[1]] = 5;
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
	interval_ghosts = setInterval(_UpdateGhosts, 800);
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
	lblLives.value = lives;
	lblTime.value = time_elapsed;
	lblFoods.value = settings.numberOfFoods - food_eaten;
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
	if (lblTime.value >= settings.gameTime){
		Start();
		alert("Time is up! You lost...")
	}

	if (lives <= 0){
		Start();
		alert("No more lives! You lost...")
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
	if (board[shape.i][shape.j] == 3) {
		_eat_pacmen();
	}else if (board[shape.i][shape.j] == 5) {
		food_eaten ++;
		score+=5;
	}else if (board[shape.i][shape.j] == 6) {
		food_eaten ++;
		score+=15;
	}else if (board[shape.i][shape.j] == 7) {
		food_eaten ++;
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
	time_elapsed =  (currentTime - start_time) / 1000;
	if (score >= 100 && time_elapsed <= 10) {
		pac_color = "green";
	}
	if (food_eaten == settings.numberOfFoods) {
		Draw();
		window.clearInterval(interval);
		window.clearInterval(interval_ghosts);
		window.clearInterval(interval_special_food);
		window.alert("Hooray! Game completed!");
	} else {
		Draw();
	}
}

function _UpdateGhosts(){
	for (let index = 0; index < settings.numberOfghosts; index++){
		ghost = ghosts[index];
		val = ghost.prev_val;
		var Dir = _FindDir(ghost);
		var new_loc = _CalcNewLoc(Dir, ghost);
		var flag = _locNotLegit(new_loc);
		console.log(flag);
		// while(flag == true){
		// 	console.log("in while loop");	
		// 	Dir = _GetRandomDir();
		// 	new_loc = _CalcNewLoc(Dir, ghost);
		// 	flag = _locNotLegit(new_loc);
		// }
		console.log("$$$$$$$$$$$$$$$$$$$$$$ out while loop");	

		
		//console.log(new_loc);
		ghost.prev_val = board[new_loc[0]][new_loc[1]];
		if (val != 2 && val != 3){
			board[ghost.i][ghost.j] = val;
		}
		ghost.i = new_loc[0];
		ghost.j = new_loc[1];
		// if(board[ghost.i][ghost.j]== 2){
		// 	_eat_pacmen();
		// }
		board[ghost.i][ghost.j] = 3;
	}
}

function _locNotLegit(new_loc){
	console.log("~~~~~~~");
	if (new_loc[0] >= 9 || new_loc[0] <= 0 || new_loc[1] >= 9 || new_loc[1] <=0){
		console.log("~~~~1~~~");
		return true;
	}else if (board[new_loc[0]][new_loc[1]] == 4 || board[new_loc[0]][new_loc[1]] == 3 || board[new_loc[0]][new_loc[1]] == 2){
		console.log("~~~~~2~~~~~~");
		return true;
	}
	console.log("~~~~~3~~~~~~");

	return false;
}

function _FindDir(ghost){
	const directions = ['L', 'R', 'U', 'D'];
	if (ghost.i - shape.i > 0) {//not right
		if (ghost.j - shape.j > 0){ //not down
			if (ghost.i - shape.i > ghost.j - shape.j){ //not up
				return 'L'
			}else{
				return 'U'
			}
		}else{
			return 'D'
		}
	}else{
		return 'R'
	}
}

function _CalcNewLoc(Dir, ghost){
	if (Dir == 'L'){
		return [ghost.i-1, ghost.j];
	}else if (Dir == 'R'){
		return [ghost.i+1, ghost.j];
	}else if (Dir == 'U'){
		return [ghost.i, ghost.j-1];
	}else if (Dir == 'D'){
		return [ghost.i, ghost.j+1];
	}
}

function _GetRandomDir(){
	directions = ['L', 'R', 'U', 'D'];
	var dir = directions[Math.floor(Math.random()*directions.length)];
	return dir;
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
	//context.drawImage(image_ghost, 10, 10, 10)
}

function _eat_pacmen(){
	alert("OH NO! You have been eaten by a Ghost!");
	if (shape.i == 4 && shape.j == 4){
		shape.i = 5;
		shape.j = 5;
	}else{
		shape.i = 4;
		shape.j = 4;
	}
	UpdatePosition();
	lives --;
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
		_setDisplayedSettings()
		
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
function _asciiToChar(n){
	if([37,38,39,40].includes(n)){
		return _arrowToChar(n)
	}
	else{
		return String.fromCharCode(n)
	}
}
function _arrowToChar(n) {
	if (n==38) {//up
		return '&#x2191;';
	}
	if (n==40) {//down
		return '&#x2193;';
	}
	if (n==37) {//left
		return '&#x2190;';
	}
	if (n==39) {//right
		return '&#x2192;';
	}
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
function _goUpDef(){
	if(buttonSelected){
		return
	}
	buttonSelected=true
	let btn=$('#go-up-btn')
	btn.html('press any key to define up key')
	btn.css("background-color",'#B22727');
	foo= function(event) {
		btn.html('Go Up')
		btn.css("background-color",afterClickColor);
		settings.upKey=event.keyCode 
		buttonSelected=false
		removeEventListener('keydown',foo)
		_setDisplayedSettings()
	}
	addEventListener('keydown',foo);


}
function _goDownDef(){
	if(buttonSelected){
		return
	}
	buttonSelected=true
	let btn=$('#go-down-btn')
	btn.html('press any key to define down key')
	btn.css("background-color",'#B22727');
	foo=function(event) {
		btn.html('Go Down')
		btn.css("background-color",afterClickColor);
		settings.downKey=event.keyCode 
		buttonSelected=false
		removeEventListener('keydown',foo)
		_setDisplayedSettings()
	}
	addEventListener('keydown', foo);
}
function _goLeftDef(){
	if(buttonSelected){
		return
	}
	buttonSelected=true
	let btn=$('#go-left-btn')
	btn.html('press any key to define left key')
	btn.css("background-color",'#B22727');
	foo=function(event) {
		btn.html('Go Left')
		btn.css("background-color",afterClickColor);
		settings.leftKey=event.keyCode 
		buttonSelected=false
		removeEventListener('keydown',foo)
		_setDisplayedSettings()
	}
	addEventListener('keydown',foo );

}
function _goRightDef(){
	if(buttonSelected){
		return
	}
	buttonSelected=true
	let btn=$('#go-right-btn')
	btn.html('press any key to define left key')
	btn.css("background-color",'#B22727');
	foo=function(event) {
		btn.html('Go Right')
		btn.css("background-color",afterClickColor);
		settings.rightKey=event.keyCode 
		buttonSelected=false
		removeEventListener('keydown',foo)
		_setDisplayedSettings()
	}
	addEventListener('keydown',foo );

}
function on5pColorChange(val){
	settings.foodColor5=val
	_setDisplayedSettings()
}
function on15pColorChange(val){
	settings.foodColor15=val
	_setDisplayedSettings()
}
function on25pColorChange(val){
	settings.foodColor25=val
	_setDisplayedSettings()
}
function onGameTimeChange(val){
	if(val<60){
		alert('Game time should be at least 60');
		$('#game-time-input').val(60)
	}
	else{
		settings.gameTime=parseInt(val)
	}
	_setDisplayedSettings()
	
}
function onFoodPointsChange(val){

	if(val<50){
		alert('Number of food points should be between 50 and 90');
		$('#food-points-input').val(50);
	}
	else if(val>90){
		alert('Number of food points should be between 50 and 90');
		$('#food-points-input').val(90);
	}
	else{
		settings.food_remain=parseInt(val)
	}
	_setDisplayedSettings()
	
}
function _setDisplayedSettings(){
	let status=
	
	'<div style="margin-bottom:8px;"> Left: '+_asciiToChar(settings.leftKey)+'</div>'+
	'<div style="margin-bottom:8px;"> up: '+_asciiToChar(settings.upKey)+'</div>'+
	'<div style="margin-bottom:8px;"> Down: '+_asciiToChar(settings.downKey)+'</div>'+
	'<div style="margin-bottom:8px;"> Right: '+_asciiToChar(settings.rightKey)+'</div>'

	// status='<div>aa</div>'
	$('#status-div').html(status )
	$('#status-div').css('font-family','sans-serif')
	$('#status-div').css('text-align','center')
}
function startGame(){
	_setScreen('game')
}