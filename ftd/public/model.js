function randint(n){ return Math.round(Math.random()*n); }
function rand(n){ return Math.random()*n; }

class Stage {
	constructor(canvas){
		this.canvas = canvas;
		this.actors= []; // all actors on this stage (monsters, player, boxes, ...)
		this.weapons = [];
		this.bullets = [];
		this.bots = [];
		this.ammos = [];
		// the logical width and height of the stage
		this.width=1000;
		this.height=1500;

		// Add the player to the center of the stage
		// this.addPlayer(new Player(this, Math.floor(this.width/2), Math.floor(this.height/2)));
		this.player= new player(this,50,50,"Red", new Pair(this.width/2,this.height/2)); // a special actor, the player
		this.addPlayer(this.player);
		//Add GUI to users screen
		this.GUI = new GUI(this.player)
		this.addActor(this.GUI);
		//Add weapons and weapons list
		var w = new Weapon(this,new Pair(600,700),20,50);
		this.addWeapon(w);
		this.addActor(w);
		//where the cursor is placed
		this.cursor = 0;
		// Add in some Balls
		var total=12;
		while(total>0){
			var x=Math.floor((Math.random()*this.width));
			var y=Math.floor((Math.random()*this.height));
			if(this.getActor(x,y)===null){
				var velocity = new Pair(rand(11), rand(11));
				var red=randint(255), green=randint(255), blue=randint(255);
				var radius = randint(30);
				var alpha = Math.random();
				var colour= 'rgba('+red+','+green+','+blue+','+alpha+')';
				var position = new Pair(x,y);
				var b = new Ball(this, position, velocity, colour, radius);
				this.bots.push(b);
				this.addActor(b);
				total--;
			}
		}
		// Create Ammo
		var total=5;
		while(total>0){
			var x = Math.floor((Math.random()*this.width));
			var y = Math.floor((Math.random()*this.height));
			if(this.getActor(x,y)===null){
				var a = new Ammo(this,new Pair(x,y),new Pair(40,5));
				this.ammos.push(a);
				this.addActor(a);
				total--;
			}
		}
	}
	removeAmmo(ammo){
		var index=this.ammos.indexOf(ammo);
		if(index!=-1){
			this.ammos.splice(index,1);
		}
	}
	getAmmo(){
		return this.ammos;
	}
	updateGUI(weapon){
		this.GUI.addWeapon(weapon);
	}
	removeBot(bot){
		var index=this.bots.indexOf(bot);
		if(index!=-1){
			this.bots.splice(index,1);
		}
	}
	createBullet(player,target,radius){
		var bullet = new Bullet(this,player,target,radius);
		this.bullets.push(bullet);
		this.addActor(bullet);
	}
	getBots(){
		return this.bots;
	}
	getCursor(){
			return this.cursor;
	}
	updateCursor(positionY,positionX){ //inverted for atan2
		this.cursor = new Pair(positionX, positionY);
		var rect = this.canvas.getBoundingClientRect();

	}
	addWeapon(weapon){
		this.weapons.push(weapon);
	}
	getWeapons(){
		return this.weapons;
	}
	addPlayer(player){
		this.addActor(player);
		this.player=player;
	}
	removePlayer(){
		this.removeActor(this.player);
		this.player=null;
	}
	addActor(actor){
		this.actors.push(actor);
	}
	removeActor(actor){
		var index=this.actors.indexOf(actor);
		if(index!=-1){
			this.actors.splice(index,1);
		}
	}
	step(){
		for(var i=0;i<this.actors.length;i++){
			this.actors[i].step();
		}
	}
	draw(){
		//drawing the stage of the map
		var context = this.canvas.getContext('2d');
		context.clearRect(0, 0, this.width, this.height);
		context.beginPath();
		context.lineWidth = "6";
		context.strokeStyle = "black";
		context.rect(0, 0, this.width, this.height);
		context.stroke();
		context.closePath();
		//Drawing most of the objects
		for(var i=0;i<this.actors.length;i++){
			this.actors[i].draw(context);
		}
	}
	// return the first actor at coordinates (x,y) return null if there is no such actor
	getActor(x, y){
		for(var i=0;i<this.actors.length;i++){
			if(this.actors[i].x==x && this.actors[i].y==y){
				return this.actors[i];
			}
		}
		return null;
	}
} // End Class Stage
class player {
	constructor(stage,width,height,color,position,speed){
		this.stage= stage;
		this.position = position;
		this.speed = 5;
		this.colour = 'rgba('+255+','+205+','+148+','+1+')';
		this.radius = 50;

		this.width = width;
		this.height = height;

		this.equipped = null;
		this.cameraPosX = this.position.x - this.stage.canvas.clientWidth/2;
		this.cameraPosY = this.position.y - this.stage.canvas.clientHeight/2;

	}
	shoot(x,y){
		// If the player has a gun.
		if (this.equipped){

			// position of the gun on the moving paper
			var raw_pos_gun = this.equipped.position;

			if(this.equipped.shoot()){
				this.stage.createBullet(this,raw_pos_gun,10);
			}
		}

	}
	draw(context){

		context.setTransform(1, 0, 0, 1, -1*(this.cameraPosX), -1*this.cameraPosY);

		context.save();
		context.fillStyle = this.colour;
		context.beginPath();
		context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, false);
		context.fill();
		context.closePath();
	}
	step(){
		//creating the camera for the player so it follows the player
		this.cameraPosX = this.position.x-this.stage.canvas.width/2;
		if (this.position.x < this.stage.canvas.clientWidth/2){
			this.cameraPosX =0;
		} else if (this.position.x + this.stage.canvas.clientWidth/2 > this.stage.width) {
			this.cameraPosX = this.stage.width - this.stage.canvas.clientWidth;
		}

		this.cameraPosY = this.position.y - this.stage.canvas.clientHeight/2;
		if (this.position.y < this.stage.canvas.clientHeight/2){ //0 case
			this.cameraPosY = 0;
		} else if (this.position.y + this.stage.canvas.clientHeight/2 > this.stage.height) {
			this.cameraPosY = this.stage.height - this.stage.canvas.clientHeight;
		}
	}
	pickUp(){
		if (!this.equipped){
			var weaps = this.stage.getWeapons();
			for (var i=0; i<weaps.length;i++){
				var weaponPosition = weaps[i].getPosition();
				var weaponLength = weaps[i].getLength();
				if ((this.position.x - weaponLength.x < weaponPosition.x) && (weaponPosition.x < this.position.x + this.width) &&
				 (this.position.y - weaponLength.y < weaponPosition.y) && (weaponPosition.y < this.position.y + this.height)){
						this.equipped= weaps[i];
						weaps[i].held(this);
						this.stage.updateGUI(weaps[i]);
					}
			}
		}
		var ammos = this.stage.getAmmo();
		if (this.equipped){
			for (var i=0;i<ammos.length;i++){
				var aPosition = ammos[i].position;
				var size = ammos[i].size;
				if (this.position.x-size.x<aPosition.x && aPosition.x < this.position.x+this.width
				 && this.position.y-size.y<aPosition.y && aPosition.y < this.position.y+this.height){
						this.equipped.ammo=30;
						this.stage.removeActor(ammos[i])
						this.stage.removeAmmo(ammos[i])
					}
				}
			}
		}
	move(player,keys){
	if (keys && keys['a'] && this.position.x>5) {
			this.position.x += -this.speed;
		}
  	if (keys && keys['d'] && this.position.x<this.stage.width) {
			this.position.x+= this.speed;
		}
  	if (keys && keys['w'] && this.position.y>5) {
			this.position.y += -this.speed;
		}
  	if (keys && keys['s'] && this.position.y<this.stage.height) {
			this.position.y += this.speed;
		}
	}
}
class GUI{//this is gonna display information like health, ammo of the player
	constructor(player){
		this.player = player;
		this.ammo = 0;
		this.health = 3;
		this.x=this.player.cameraPosX;
		this.weapon = null;
	}
	draw(context){
		context.save();
		if (!this.player.cameraPosX)
			var x=0;
		else
			var x=this.player.cameraPosX;
		context.translate(x,this.player.cameraPosY);
		context.beginPath();
		context.fillStyle="black"
		context.font = "30px Arial";
		context.fillText("Ammo: "+this.ammo,10,50);
		context.fillText("Health: "+this.health,10,context.canvas.clientHeight-30);
		context.restore();
	}
	step(){
		if(this.weapon)
			this.ammo = this.weapon.ammo;
	}
	addWeapon(weapon){
		this.weapon = weapon
	}
}
class Pair {
	constructor(x,y){
		this.x=x; this.y=y;
	}
	toString(){
		return "("+this.x+","+this.y+")";
	}
	normalize(){
		var magnitude=Math.sqrt(this.x*this.x+this.y*this.y);
		this.x=this.x/magnitude;
		this.y=this.y/magnitude;
	}
}
class Weapon {
	constructor(stage, position,width,height) {
		this.stage = stage;
		this.position = position;
		this.equipped = false;
		this.length = new Pair(width,height);
		this.rotation = 0;
		this.ammo = 30;
	}
	draw(context){
		context.save();
		context.translate(this.position.x,this.position.y);
		context.beginPath();
		context.fillStyle = "gray";
		context.strokeStyle = "gray";
		context.rotate(this.rotation);
		context.rect(0,-6,25,12);
		context.fill();
		context.closePath();
		context.stroke();
		context.restore();
	}
	held(player){
		if (!this.equipped){
			this.equipped = player;
		}
	}
	step(){
		if (this.equipped){

			//Where the canvas is in relation to the moving paper
			var rect = this.stage.canvas.getBoundingClientRect();

			// position of the player on the moving paper
			var raw_pos_player = this.equipped.position; 	// this should be p,q cuz its the pos of player

			var tx = raw_pos_player.x - this.equipped.cameraPosX;
			var ty = raw_pos_player.y - this.equipped.cameraPosY;
			// position of the player on the paper with the hole
			var pos_player = new Pair(rect.x + tx, rect.y + ty);
			// cursor position on the paper with the hole (better this way since
			// even if the mouse is placed outside of the canvas, it will still
			//work.)
			var cursor = this.stage.getCursor();

			var slope = new Pair(cursor.x - pos_player.x, cursor.y - pos_player.y);
			var angle_Rad = Math.atan2(slope.y,slope.x);
			this.rotation = angle_Rad;

			slope.normalize();	//It converts slope vector into unit vectors.

			// 55 is the distance of the gun from the center of the player.
			this.position.x = raw_pos_player.x + slope.x * 55;
			this.position.y = raw_pos_player.y + slope.y * 55;

			// console.log((angle_Rad*180)/Math.PI);

		}
	}
	getPosition(){
		return this.position;
	}
	getLength(){
		return this.length;
	}
	shoot(){
		if (this.ammo>0){
			this.ammo--;
			return true
		}
			return false
	}
}
class Bullet {
	constructor(stage,player,position, radius){
		this.stage = stage;
		// Bullets should start firing from the gun position.
		this.position = new Pair(player.equipped.position.x,player.equipped.position.y);
		this.range = 300;
		this.initial = new Pair(this.position.x,this.position.y);
		this.dx = position.x-player.position.x;
		this.dy = position.y-player.position.y;
		this.radius = radius;
		this.color ="Black";
	}
	draw(context){
		context.save();
		context.fillStyle = this.color;
		context.strokeStyle = this.color;
		context.beginPath();
		context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, false);
		context.fill();
		context.closePath();
		context.restore();
	}
	step(){
		//updating position of bullet
		this.position.x+=(this.dx)/10;
		this.position.y+=(this.dy)/10;
		//collision check with walls
		if (this.position.x<0 || this.position.x>this.stage.width || this.position.y>this.stage.height || this.position.y < 0
		 || this.initial.x+200<this.position.x || this.initial.x-200>this.position.x || this.initial.y+200<this.position.y
		 || this.initial.y-200>this.position.y){
			stage.removeActor(this);
		}
		//collision check with enemies
		var enemies = this.stage.getBots();
		for (var i=0; i<enemies.length;i++){
			if ((this.position.x-this.radius <enemies[i].position.x && enemies[i].position.x < this.position.x+this.radius)
			&&
				 (this.position.y-this.radius <enemies[i].position.y && enemies[i].position.y < this.position.y+this.radius)){
						enemies[i].hit();
					}
		}
	}
}
class Ball {
	constructor(stage, position, velocity, colour, radius){
		this.stage = stage;
		this.position=position;
		this.intPosition(); // this.x, this.y are int version of this.position
		this.hp=3; //hit 3 times the ball dies
		this.velocity=velocity;
		this.colour = colour;
		this.radius = radius;
	}

	headTo(position){
		this.velocity.x=(position.x-this.position.x);
		this.velocity.y=(position.y-this.position.y);
		this.velocity.normalize();
	}
	hit(){
		this.hp--;
		if (this.hp==0){
			this.stage.removeActor(this)
			this.stage.removeBot(this)
		}
	}
	toString(){
		return this.position.toString() + " " + this.velocity.toString();
	}

	step(){
		this.position.x=this.position.x+this.velocity.x;
		this.position.y=this.position.y+this.velocity.y;

		// bounce off the walls
		if(this.position.x<0){
			this.position.x=0;
			this.velocity.x=Math.abs(this.velocity.x);
		}
		if(this.position.x>this.stage.width){
			this.position.x=this.stage.width;
			this.velocity.x=-Math.abs(this.velocity.x);
		}
		if(this.position.y<0){
			this.position.y=0;
			this.velocity.y=Math.abs(this.velocity.y);
		}
		if(this.position.y>this.stage.height){
			this.position.y=this.stage.height;
			this.velocity.y=-Math.abs(this.velocity.y);
		}
		this.intPosition();
	}
	intPosition(){
		this.x = Math.round(this.position.x);
		this.y = Math.round(this.position.y);
	}
	draw(context){
		context.fillStyle = this.colour;
		context.strokeStyle = this.colour;
   		// context.fillRect(this.x, this.y, this.radius,this.radius);
		context.beginPath();
		context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
		context.fill();
		context.closePath();
	}
}
class Ammo{
	constructor(stage,position,size){
		this.stage = stage;
		this.position = position;
		this.size = size;
	}
	draw(context){
		context.beginPath();
		context.strokeStyle = "Purple";
		context.fillStyle = "Purple";
		context.rect(this.position.x,this.position.y,this.size.x,this.size.y);
		context.stroke();
		context.fill();
		context.closePath();
	}
	step(){}
}
