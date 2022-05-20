var context;
var shape = new Object();
var special_food = {
	i:5,
	j:5,
	prev_val:0,
	value:50
};
var board;
var no_ghosts_board;
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
	foodColor5:'#355070',
	foodColor15:'#65D97A',
	foodColor25:'#B56576',
	// foodColor5:'blue',
	// foodColor15:'yellow',
	// foodColor25:'green',
	gameTime:60,
	numberOfghosts:4
}
afterClickColor ='#2A2550'
var food_eaten = 0;
var keyDownFoo=function(e) {
	keysDown[e.keyCode] = true;
};
var keyUpFoo=function(e) {
	keysDown[e.keyCode] = false;
};
//ghosts array init
ghosts = [
	{i: 0, j:0,super:true},
	{i: 0, j:9,super:false},
	{i: 9, j:0,super:false},
	{i: 9, j:9,super:false}
]


//images and sounds
var music = new Audio('music.mp3');
music.volume=0.01
var ghost_img_path = 'ghost2.png';
var candy_img_path = 'cherry.png';
var wall_img_path = 'wall.jpg';

var ghost_img = document.createElement('img');
ghost_img.src = ghost_img_path;

var candy_img = document.createElement('img');
candy_img.src = candy_img_path;

var wall_img = document.createElement('img');
wall_img.src = wall_img_path;


$(document).ready(function() {
	context = canvas.getContext("2d");
	Start();
	const user = localStorage.getItem('currentUser');
	
	if(user){
		_setUserIndex(user);
		_setScreen('settings'); //TODO:: change back to settings
	}
	else _setScreen('welcome');
});
function Start() {
	
	play_music();

	ghosts_init_loc = [[0,0],[0,9],[9,0],[9,9]].slice(-settings.numberOfghosts);
	
	ghosts = [
		{i: 0, j:0,super:true},
		{i: 0, j:9,super:false},
		{i: 9, j:0,super:false},
		{i: 9, j:9,super:false}
	].slice(-settings.numberOfghosts)
	_createBoard()
	// Draw()
}
//generate the game board
//0:blank , 2:pacman , 3: ghost , 4:wall , 5:food-5 , 6: food-15 , 7:food-25 , 8:random food - 50
function _createBoard(){

	_addListeners() 	//clear intervals before each start of the game (like loosing) and start new intervals


	board = new Array();
	no_ghosts_board = new Array();
	score = 0;
	food_eaten = 0;
	lives = 5;
	pac_color = "yellow";
	food_remain = settings.numberOfFoods;
	//var food_eaten = 0;
	var cnt = 100;//number of cells
	var pacman_remain = 1;
	//var special_food_remain = 1;
	start_time = new Date();
	for (var i = 0; i < 10; i++) {
		board[i] = new Array();
		no_ghosts_board[i] = new Array();
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
				board[i][j] = 4; //wall
				no_ghosts_board[i][j] = 4;
			} 
			else if(ghosts_init_loc.includes([i,j])){
				board[i][j] = 3;
			}else if(i == 5 && j == 5){
				//board[i][j] = 8;
				no_ghosts_board[i][j] = 0;
			}else {
				
				var randomNum = Math.random();
				if (randomNum <= (1.0 * food_remain) / cnt) {
					food_remain--;
					var randomFood = Math.random();
					if (randomFood <= 0.6){
						board[i][j] = 5;
						no_ghosts_board[i][j] = 5;

					}else if(randomFood <= 0.9){
						board[i][j] = 6;
						no_ghosts_board[i][j] = 6;

					}else{
						board[i][j] = 7;
						no_ghosts_board[i][j] = 7;
					}
					
				} else if (randomNum < (1.0 * (pacman_remain + food_remain)) / cnt) {
					//bug??
					if (i <= 7 && i >= 2 && j <= 7 && j >= 2)
					{					
						shape.i = i;
						shape.j = j;
						pacman_remain--;
						board[i][j] = 2;
						no_ghosts_board[i][j] = 2;
					}

				} else {
					board[i][j] = 0;
					no_ghosts_board[i][j] = 0;
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
		board[emptyCell[0]][emptyCell[1]] = 5;
		food_remain--;
	}


}

function play_music(){
	music.volume=0.01
	music.currentTime = 0
	music.play();
}

//add key listeners
function _addListeners(){
	window.removeEventListener('keydown',keyDownFoo);
	window.removeEventListener('keyup',keyUpFoo);
	keysDown = {};
	addEventListener(
		"keydown",
		keyDownFoo,
		false
	);
	addEventListener(
		"keyup",
		keyUpFoo,
		false
	);
	_clearIntervals()
	setIntervals()
}
function _clearIntervals(){
	window.clearInterval(interval);
	window.clearInterval(interval_ghosts);
	window.clearInterval(interval_special_food);
}
function setIntervals(){
	interval = setInterval(UpdatePosition, 100);
	interval_ghosts = setInterval(_UpdateGhosts, 500);
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
	}//else{return }
}

function Draw() {
	canvas.width = canvas.width; //clean board
	lblScore.value = score;
	lblLives.value = lives;
	lblTime.value = time_elapsed;
	//lblFoods.value = settings.numberOfFoods - food_eaten;
	for (var i = 0; i < 10; i++) {
		for (var j = 0; j < 10; j++) {
			var center = new Object();
			center.x = i * 60 + 30;
			center.y = j * 60 + 30;
			if (board[i][j] == 2) {
				_draw_pacman(center);
			} else if (board[i][j] == 3) {
				_draw_ghost(center,i,j);
			} else if (board[i][j] == 4) {
				context.beginPath();
				context.drawImage(wall_img, center.x-20, center.y-20, 60, 60)
				//context.arc(center.x, center.y, 15, 0, 2 * Math.PI); // circle
				//context.fillStyle = "red"; //color
				context.fill();
				// context.beginPath();
				// context.rect(center.x - 30, center.y - 30, 60, 60);
				// context.fillStyle = "grey"; //color
				// context.fill();
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
				context.drawImage(candy_img, center.x-20, center.y-20, 50, 50)
				//context.arc(center.x, center.y, 15, 0, 2 * Math.PI); // circle
				//context.fillStyle = "red"; //color
				context.fill();
			}
		}
	}
}

function UpdatePosition() { //for pacman character
	// board[shape.i][shape.j]=0;
	// no_ghosts_board[shape.i][shape.j]=0;

	// if (lblTime.value == settings.gameTime){
	// 	_endgame();
	// }
	board[shape.i][shape.j] = 0;
	no_ghosts_board[shape.i][shape.j]=0;

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
	prev = board[shape.i][shape.j]
	board[shape.i][shape.j] = 2;//new place
	var currentTime = new Date();
	time_elapsed = settings.gameTime - (currentTime - start_time) / 1000;
	if (score >= 20 && time_elapsed <= 10) {
		pac_color = "green";
	}
	if (prev == 3){
		_eat_pacmen();
	}
	let win = true;
	for (let y = 0; y < no_ghosts_board.length; y++) {
		for (let x = 0; x < no_ghosts_board.length; x++) {
			if (no_ghosts_board[x][y] != 0 && no_ghosts_board[x][y] != 2 && no_ghosts_board[x][y] != 4){
				win = false
			}
		}
	}
	if (win) {
		Draw();
		window.clearInterval(interval);
		window.clearInterval(interval_ghosts);
		window.clearInterval(interval_special_food);
		window.alert("You Won!!!");
		Start();
	}else if(lives == 0){
		window.clearInterval(interval);
		window.clearInterval(interval_ghosts);
		window.clearInterval(interval_special_food);
		music.pause();
		window.alert("You Lost! no more lives...");
		Start();
	}else if(time_elapsed <= 0){
		window.clearInterval(interval);
		window.clearInterval(interval_ghosts);
		window.clearInterval(interval_special_food);
		window.alert("You Lost! time is up...");
		Start();
	} else {
		Draw();
	}
}

function _initGhostLoc(){
	for (let index = 0; index < ghosts.length; index++) {
		board[ghosts[index].i][ghosts[index].j] = 0; //"erase" final location of ghosts 
		
	}
	ghosts = [
		{i: 0, j:0},
		{i: 0, j:9},
		{i: 9, j:0},
		{i: 9, j:9}
	].slice(-settings.numberOfghosts);

	for (let index = 0; index < ghosts.length; index++) {
		board[ghosts[index].i][ghosts[index].j] = 3; //put the ghosts again in their initial placecs
		
	}

}

function _initPacLoc(){
	board[shape.i][shape.j]=0 //"erase" final location of pacman 
	no_ghosts_board[shape.i][shape.j]=0 //"erase" final location of pacman 

	board[special_food.i][special_food.j]=no_ghosts_board[special_food.i][special_food.j] //"erase" final location of specal food 

	cell1 = findRandomEmptyCell(board);
	shape.i = 5//cell1[0];
	shape.j = 6//cell1[1];
	turn='R'

	board[shape.i][shape.j]=2 //put the pacman again in his initial placecs
	no_ghosts_board[shape.i][shape.j]=2 //put the pacman again in his initial placecs

	cell2 = findRandomEmptyCell(board);
	special_food.i = cell2[0];
	special_food.j = cell2[1];

}

function _UpdateGhosts(){
	for (let index = 0; index < ghosts.length; index++) {
		ghost = ghosts[index];


		// val = ghost.prev_val;
		var Dir = _FindDir(ghost);
		var new_loc = _CalcNewLoc(Dir, ghost);

		if (_locNotLegit(new_loc)){
			Dir = _GetRandomDir(ghost, Dir);
			new_loc = _CalcNewLoc(Dir, ghost);
		}
		//curr_val = no_ghosts_board[ghost.i][ghost.j];
		board[ghost.i][ghost.j] = no_ghosts_board[ghost.i][ghost.j];

		ghost.i = new_loc[0];
		ghost.j = new_loc[1];

		board[ghost.i][ghost.j] = 3;
		
		if(ghost.i==shape.i && ghost.j==shape.j){
			_eat_pacmen();
			Draw();
			return;
		}
	}

	Draw(); //after changing all the ghosts locations
}

function _locNotLegit(new_loc){
	if (new_loc[0] > 9 || new_loc[0] < 0 || new_loc[1] > 9 || new_loc[1] <0){
		return true;
	}else if (board[new_loc[0]][new_loc[1]] == 4 || board[new_loc[0]][new_loc[1]] == 3 || board[new_loc[0]][new_loc[1]] == 8){
		return true;
	}
	return false;
}

function _FindDir(ghost){
	let bestDistance=Number.POSITIVE_INFINITY
	let res='U';
	let shapePos=[shape.i,shape.j]
	if(getManhetenDistance(shapePos,[ghost.i+1,ghost.j])<bestDistance && !isWall([ghost.i+1,ghost.j])){
		bestDistance=getManhetenDistance(shapePos,[ghost.i+1,ghost.j])
		res='R'
	}
	if(getManhetenDistance(shapePos,[ghost.i,ghost.j+1])<bestDistance && !isWall([ghost.i,ghost.j+1])){
		bestDistance=getManhetenDistance(shapePos,[ghost.i+1,ghost.j])
		res='D'
	}
	if(getManhetenDistance(shapePos,[ghost.i,ghost.j-1])<bestDistance && !isWall([ghost.i,ghost.j-1])){
		bestDistance=getManhetenDistance(shapePos,[ghost.i,ghost.j-1])
		res='U'
	}
	if(getManhetenDistance(shapePos,[ghost.i-1,ghost.j])<bestDistance && !isWall([ghost.i-1,ghost.j])){
		getManhetenDistance(shapePos,[ghost.i-1,ghost.j])
		res='L'
	}
	return res;
	if (ghost.i - shape.i > 0) {
		//pacmen is left to ghost
		if (ghost.j - shape.j > 0){
			//pacmen is up to ghost
			if (ghost.i - shape.i > ghost.j - shape.j){ 
				//pacmen is far left then up to ghost
				return 'L'
			}else{
				return 'U'
			}
		}else{
			//pacmen is down to ghost
			return 'D'
		}
	}else{
		//pacmen is right to ghost
		return 'R'
	}
}
function isWall(p){
	if(p[0]<0 || p[0]>9){
		return false
	}
	if(p[1]<0 || p[1]>9){
		return false
	}
	return board[p[0]][p[1]]==4
}

function getManhetenDistance(p1,p2){
	return Math.abs(p1[0]-p2[0]) + Math.abs(p1[1]-p2[1]);
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

function _GetRandomDir(ghost, badDir){
	let directions = [];
	if (_locNotLegit([ghost.i-1, ghost.j]) == false && badDir != 'L'){ //L
		directions.push('L');
	}
	if (_locNotLegit([ghost.i+1, ghost.j]) == false && badDir != 'R'){ //R
		directions.push('R');
	}
	if (_locNotLegit([ghost.i, ghost.j-1]) == false && badDir != 'U'){ //U
		directions.push('U');
	}
	if (_locNotLegit([ghost.i, ghost.j+1]) == false && badDir != 'D'){ //D
		directions.push('D');
	}
	dir = directions[Math.floor(Math.random()*directions.length)]
	return dir;

}

function _UpdateSpecialFood(){
	var random = Math.random();
	if (random <= 0.25){
		if (special_food.i+1 <= 9 && board[special_food.i+1][special_food.j] != 4 && board[special_food.i+1][special_food.j] != 2){
			val = special_food.prev_val;
			special_food.prev_val = no_ghosts_board[special_food.i+1][special_food.j]
			special_food.i++;
			board[special_food.i][special_food.j] = 8;
			board[special_food.i-1][special_food.j] = val;
		}
	}else if (random <= 0.5){
		if (special_food.i-1 >=0 && board[special_food.i-1][special_food.j] != 4 && board[special_food.i-1][special_food.j] != 2){
			val = special_food.prev_val;
			special_food.prev_val = no_ghosts_board[special_food.i-1][special_food.j]
			special_food.i--;
			board[special_food.i][special_food.j] = 8;
			board[special_food.i+1][special_food.j] = val;
		}
	}else if (random <= 0.75){
		if (special_food.j-1 >=0 && board[special_food.i][special_food.j-1] != 4 && board[special_food.i][special_food.j-1] != 2){
			val = special_food.prev_val;
			special_food.prev_val = no_ghosts_board[special_food.i][special_food.j-1]
			special_food.j--;
			board[special_food.i][special_food.j] = 8;
			board[special_food.i][special_food.j+1] = val;
		}
	}else{
		if (special_food.j+1 <= 9 && board[special_food.i][special_food.j+1] != 4 && board[special_food.i][special_food.j+1] != 2){
			val = special_food.prev_val;
			special_food.prev_val = no_ghosts_board[special_food.i][special_food.j+1]
			special_food.j++;
			board[special_food.i][special_food.j] = 8;
			board[special_food.i][special_food.j-1] = val;
		}
	}
	Draw();
}

//Draw functions:

function _draw_pacman(center){
	pacRadius=25
	eyeRadius=3.5
	if (turn == 'U'){	context.beginPath();
		context.arc(center.x, center.y, pacRadius, 1.65 * Math.PI, 1.35 * Math.PI); // half circle
		context.lineTo(center.x, center.y);
		context.fillStyle = pac_color; //color
		context.fill();//pacman body
		context.beginPath();
		context.arc(center.x - 15, center.y - 5, eyeRadius, 0, 2 * Math.PI); // circle
		context.fillStyle = "black"; //color
		context.fill();//pacman eye

	}

	if (turn == 'D'){
		context.beginPath();
		context.arc(center.x, center.y, pacRadius, 0.65 * Math.PI, 0.35 * Math.PI); // half circle
		context.lineTo(center.x, center.y);
		context.fillStyle = pac_color; //color
		context.fill();//pacman body
		context.beginPath();
		context.arc(center.x + 15, center.y + 5, eyeRadius, 0, 2 * Math.PI); // circle
		context.fillStyle = "black"; //color
		context.fill();//pacman eye
	}

	if (turn == 'L'){
		context.beginPath();
		context.arc(center.x, center.y, pacRadius, 1.15 * Math.PI, 0.85 * Math.PI); // half circle
		context.lineTo(center.x, center.y);
		context.fillStyle = pac_color; //color
		context.fill();//pacman body
		context.beginPath();
		context.arc(center.x - 5, center.y - 15, eyeRadius, 0, 2 * Math.PI); // circle
		context.fillStyle = "black"; //color
		context.fill();//pacman eye
	}

	if (turn == 'R'){
		context.beginPath();
		context.arc(center.x, center.y, pacRadius, 0.15 * Math.PI, 1.85 * Math.PI); // half circle
		context.lineTo(center.x, center.y);
		context.fillStyle = pac_color; //color
		context.fill();//pacman body
		context.beginPath();
		context.arc(center.x + 5, center.y - 15, eyeRadius, 0, 2 * Math.PI); // circle
		context.fillStyle = "black"; //color
		context.fill();//pacman eye
	}

}

function _draw_ghost(center,i,j){
	ghost=ghosts.find(g=>g.i==i && g.j==j)
	context.beginPath();
	if(ghost.super){
		context.drawImage(ghost_img, center.x-20, center.y-20, 50, 50)
	}
	else{
		context.drawImage(ghost_img, center.x-20, center.y-20, 50, 50)
	}
	
	//context.arc(center.x, center.y, 15, 0, 2 * Math.PI); // circle
	//context.fillStyle = "red"; //color
	context.fill();
}

function _eat_pacmen(){

	_addListeners() 
	alert("OH NO! You've been eaten by a ghost");
	lives --;
	score=score-10;
	
	_initGhostLoc();
	_initPacLoc();
	Draw();
}

function _setScreen(screen){
	_displayNoneAllScreens()
	if(screen==='welcome'){
		onExitGameGame()
		_displayScreen('welcome_screen')
	}
	else if(screen==='register'){
		onExitGameGame()
		_displayScreen('register_screen')
	}
	else if(screen==='log_in'){
		onExitGameGame()
		_displayScreen('log_in_screen')
	
	}
	else if(screen==='settings'){
		onExitGameGame()
		_displayScreen('settings_screen')
		$('#status-div-div').css('display','flex')
		$('#status-div-div').css('flex-direction','column')
		_setDisplayedSettings()
		
	}
	else if(screen==='game'){
		_displayScreen('game_screen')
		$('#status-div-div').css('display','flex')
		$('#status-div-div').css('flex-direction','column')
		_setDisplayedSettings()
		
	}

}


function _displayScreen(screen){
	document.getElementById(screen).style.display='flex'
	document.getElementById(screen).style.justifyContent='center'
}
function _displayNoneAllScreens(){
	document.getElementById('welcome_screen').style.display='none'
	document.getElementById('register_screen').style.display='none'
	$('#status-div-div').css('display','none')
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
	if(users.map(u=>u.username).includes(registerForm.username)){
		alert('User is already registered');
		return false
	}
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
			localStorage.setItem('currentUser', login.username);
			_setUserIndex(login.username)
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

	btn.css("background-color",'#B22727');
	btn.css("color",'white');
	foo= function(event) {
		btn.html('Go Up')
		btn.css("background-color",afterClickColor);
		btn.css("color",'white');
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

	btn.css("background-color",'#B22727');
	btn.css("color",'white');
	foo=function(event) {
		btn.html('Go Down')
		btn.css("background-color",afterClickColor);
		btn.css("color",'white');
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

	btn.css("background-color",'#B22727');
	btn.css("color",'white');
	foo=function(event) {
		btn.html('Go Left')
		btn.css("background-color",afterClickColor);
		btn.css("color",'white');
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

	btn.css("background-color",'#B22727');
	btn.css("color",'white');
	foo=function(event) {
		btn.html('Go Right')
		btn.css("background-color",afterClickColor);
		btn.css("color",'white');
		settings.rightKey=event.keyCode 
		buttonSelected=false
		removeEventListener('keydown',foo)
		_setDisplayedSettings()
	}
	addEventListener('keydown',foo );

}
function randomColors(){
	let food5='#'+(0x1000000+Math.random()*0xffffff).toString(16).substr(1,6)
	let food15='#'+(0x1000000+Math.random()*0xffffff).toString(16).substr(1,6)
	let food25='#'+(0x1000000+Math.random()*0xffffff).toString(16).substr(1,6)
	$('#5p-input').val(food5)
	$('#15p-input').val(food15)
	$('#25p-input').val(food25)
	settings.foodColor5=food5
	settings.foodColor15=food15
	settings.foodColor25=food25
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
function onGhostAmountChange(val){
	if(val<1 || val>4){
		alert('Ghosts Quantity should be 1-4');
		$('#ghosts-input').val(4)
	}
	else{
		settings.numberOfghosts=parseInt(val)
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
		settings.numberOfFoods=parseInt(val)
	}
	_setDisplayedSettings()
	
}
function _setDisplayedSettings(){
	let status=
	
	'<div style="margin-bottom:8px;"> Left: '+_asciiToChar(settings.leftKey)+'</div>'+
	'<div style="margin-bottom:8px;"> up: '+_asciiToChar(settings.upKey)+'</div>'+
	'<div style="margin-bottom:8px;"> Down: '+_asciiToChar(settings.downKey)+'</div>'+
	'<div style="margin-bottom:8px;"> Right: '+_asciiToChar(settings.rightKey)+'</div>'+
	'<div style="margin-bottom:8px;"> 5 points food color: '+settings.foodColor5+'</div>'+
	'<div style="margin-bottom:8px;"> 15 points food color: '+settings.foodColor15+'</div>'+
	'<div style="margin-bottom:8px;"> 25 points food color: '+settings.foodColor25+'</div>'+
	'<div style="margin-bottom:8px;"> Game Time: '+settings.gameTime+'</div>'+
	'<div style="margin-bottom:8px;"> Number of foods in game: '+settings.numberOfFoods+'</div>'+
	'<div style="margin-bottom:8px;"> Number of ghosts: '+settings.numberOfghosts+'</div>'

	// status='<div>aa</div>'
	$('#status-div').html(status)
	$('#status-div').css('font-family','sans-serif')
	$('#status-div').css('text-align','center')
}
function startGame(){

	_setScreen('game')
	Start();
	$('#status-div-div').css('position','relative')
	$('#status-div-div').css('top','150px')
	
}
function _setUserIndex(username){
	$('#userInfo').html(
		'<i class="glyphicon glyphicon-user" style="margin-right: 15px;"></i>'+
		username
		)
}
function onExitGameGame(){
	$('#status-div-div').css('top','0px')
	_clearIntervals()
	music.pause()
	// document.getElementById('game_screen').removeChild('game');
}
