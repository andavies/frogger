/*  app.js
 *
 * Andy Davies
 * 
 * This file is where the game's functionality is implemented 
 *
 */

/**********************************************************************************/
// PLAYER

// Player constructor
var Player = function(x, y){
    this.x = x;
    this.y = y;
    // keep sprite here instead of prototype incase of multiple players in future
    this.sprite = 'img/char-boy.png';
};

// Player prototype
Player.prototype = {
    update : function(){

        // player control and edge of screen detection
        // TODO factor out hardcoding into sprite width constants
        if (this.keyPressed === 'right' && this.x < 400){
            this.x += 100;
        }
        if (this.keyPressed === 'left' && this.x > 10){
            this.x += -100;
        }
        if (this.keyPressed === 'up' && this.y > 10){
            this.y -= 83;
        }
        if (this.keyPressed === 'down' && this.y < 400){
            this.y -= -83;
        }
        // reset key press
        this.keyPressed = null;

        // if player reaches water...
        if (this.y < 60) {
            
            //update scores
            totalScore += interimScore;
            interimScore = 0;

            // reset player
            this.reset();
        }
    },

    handleInput : function(e){
        this.keyPressed = e;
    },

    reset : function(){
        // TODO factor these constants out
        this.x = 200;
        this.y = 405;
    },

    render : function(){
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }    
};

/************************************************************************************/
// ENEMIES

// Enemy constructor
var Enemy = function(x, y, speed){
    this.x = x;
    this.y = y;
    this.speed = speed;
};

// Enemy prototype
Enemy.prototype = {

    sprite : 'img/enemy-bug.png',

    update : function(dt){
        // stop speed from being too low TODO: come back to this
        if (this.speed < 0.3){
            this.speed += 0.3;
        }

        // movement
        (this.x += 5 * this.speed) * dt;

        // loop to the start when off screen
        if (this.x > 650) {
            this.x = -300;
            // vary speed on next run
            this.speed = Math.random();
        }

        // when collide with player..
        // TODO refactor these as width constants
        if (this.x < player.x + 25 && this.x + 50 > player.x &&
            this.y < player.y + 50 && 50 + this.y > player.y) {

            // ...move player to start
            player.reset();

            // ...reset interim score
            interimScore = 0;
        }
    },

    render : function(){
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
};

/***********************************************************************************/
// COLLECTABLES

/* Collectable is the superclass. 
 * GemBlue, GemOrgange and Heart are sub-classes of Collectable
 */

// Collectable constructor
var Collectable = function() {};

// define prototype methods
Collectable.prototype = {

    render: function() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    },
    
    // reset method called at start of game and when player touches it
    reset: function() {
        // move to random point on grid (centred in grid squares)
        this.x = (getRandomInt(0, 5) * 100) + 20;
        this.y = (getRandomInt(0, 3) * 82) + 100;
    },

    update: function() {
        // test for collision with player 
        // TODO: taken from enemy class: refactor into generic test?
        if (this.x < player.x + 25 && this.x + 50 > player.x &&
            this.y < player.y + 50 && 50 + this.y > player.y) {

            // reset collectable
            // move off screen, then reset after 2 seconds
            this.x = -200;
            this.y = -200;
            setTimeout(this.reset.bind(this), 2000);

            // update interimScore
            interimScore += this.value;            
        }
    }    
}

// define subclasses 
var GemBlue = function(x, y) {
    Collectable.call(this, x, y);
}
var GemOrange = function(x, y) {
    Collectable.call(this, x, y);
}
var Heart = function(x, y) {
    Collectable.call(this, x, y);
}

// define subclass prototypes, delegate to the superclass
GemBlue.prototype = Object.create(Collectable.prototype);
GemBlue.prototype.sprite = 'img/Gem Blue.png';
GemBlue.prototype.value = 1;

GemOrange.prototype = Object.create(Collectable.prototype);
GemOrange.prototype.sprite = 'img/Gem Orange.png';
GemOrange.prototype.value = 5;

Heart.prototype = Object.create(Collectable.prototype);
Heart.prototype.sprite = 'img/Heart.png';
Heart.prototype.value = 10;

/********************************************************************************/
// TIMER

/* dtCount keeps track of dt (provided by engine.js) to match the 
 * game loop 'time' to our timer here. Initialised outside repeating
 * render method
 */
var dtCount = 0;

// set timer font here to avoid setting it every time render function is called    
ctx.font = "80px Georgia";

// game timer class
var Timer = function(){};

// timer render function
Timer.prototype.render = function() {
    ctx.fillText(seconds, 16, 120);
}

// timer update function
Timer.prototype.update = function(dt, reset) {

    /* dt is the time between game ticks
       dtCount is a cumulative log of the game ticks */
    dtCount += dt;

    // once a second has passed..
    if (dtCount > 1) {
        seconds--;
        // reset dtCount for the next second
        dtCount = 0;
    }

    // if time run out, reset
    if (seconds === 0) {
        reset();
    }
}



/*************************************************************************************/
// SCORE

// initialise scores
var interimScore = 0;
var totalScore = 0;

var ScoreBoard = function(type, x, y) {
    this.type = type;
    this.x = x;
    this.y = y;
};

// TODO: make logic cleaner here? Do we need them to be the same class?
ScoreBoard.prototype.render = function() {
    if (this.type === 'interim'){
        ctx.fillText(interimScore, this.x, this.y);
    }
    else if (this.type === 'total'){
        ctx.fillText(totalScore, this.x, this.y);
    }    
};

/*******************************************************************************/
// INSTANTIATE OBJECTS

// instantiate player

var player = new Player(200, 405);

// instantiate enemies

var allEnemies = [];
var numOfEnemies = 10;
// Encapsulate in IIFE to prevent variables x and y polluting global scope
(function() {
   for (var i = 0; i < numOfEnemies; i++){
        // stagger staring x value so enemies dont come in waves of 3
        // TODO make cleaner with switch
        // TODO factor into makeEnemies function
        var x = i * 100;
        if ((i % 3) === 0) {
            var y = 65;
        }
        else if ((i % 3) === 1) {
            var y = 150;
        }
        else if ((i % 3) === 2) {
            var y = 230;
        }
        // TODO factor out speed here?
        var enemy = new Enemy(x, y, Math.random());
        allEnemies.push(enemy);
    }; 
})();  

// instantiate collectables

var collectables = [];
var numOfEach = 1;

for (var i = 0; i < numOfEach; i++) {
    // TODO: make this cleaner?
    
    var heart = new Heart();
    collectables.push(heart);

    
    var gemBlue = new GemBlue();
    collectables.push(gemBlue);

    
    var gemOrange = new GemOrange();
    collectables.push(gemOrange);
}

// instantiate timer
var timer = new Timer();


// instantiate scores
var interimScoreBoard = new ScoreBoard('interim', 320, 120);
var totalScoreBoard = new ScoreBoard('total', 420, 120);


/**********************************************************************/
// FUNCTIONS

// TODO: move these to seperate file. (in fact split this entire file up)

// This listens for key presses and sends the keys to the Player.handleInput() method.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };
    player.handleInput(allowedKeys[e.keyCode]);
});

// disable ability to scroll using arrow keys, so as not to interfere with game controls
document.onkeydown = function(e) {
    var k = e.keyCode;
    if(k >= 37 && k <= 40) {
        return false;
    }
};

/* Returns a random integer between min (included) and max (excluded)
 * from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
 * used by collectables.reset
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
