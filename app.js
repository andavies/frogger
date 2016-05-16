/*  app.js
    Andrew Davies (and udacity.com)
    23/02/16
    1andydavies1@gmail.com */

/* This file is where the game's functionality is implemented */

// Enemy pseudoclassical class
var Enemy = function(x, y, speed){
    this.x = x;
    this.y = y;
    this.speed = speed;
};
Enemy.prototype = {
    sprite : 'img/enemy-bug.png',
    update : function(dt){
        // hack speed to stop it being too slow
        // TODO come back to this
        if (this.speed < 0.3){
            this.speed += 0.3;
        }
        // movement
        (this.x += 5 * this.speed) * dt;

        // loop to start when off screen
        if (this.x > 650) {
            this.x = -300;
            // vary speed on next run
            this.speed = Math.random();
        }

        // handle player collision
        // TODO refactor these as width constants
        if (this.x < player.x + 25 && this.x + 50 > player.x &&
            this.y < player.y + 50 && 50 + this.y > player.y) {

            player.reset();
        }
    },
    render : function(){
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
};

// Player pseudoclassical class
var Player = function(x, y){
    this.x = x;
    this.y = y;
    // keep sprite here instead of prototype incase of multiple players in future
    this.sprite = 'img/char-boy.png';
};
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

        // if reaches water, reset position
        if (this.y < 60) {
            // bind player to 'this' (would be bound to window otherwise)
            setTimeout(this.reset.bind(this), 500);
        }
    },
    reset : function(){
        // TODO factor these constants out
        this.x = 200;
        this.y = 405;
    },
    render : function(){
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    },
    handleInput : function(e){
        this.keyPressed = e;
    }
};


// instantiate enemies

var allEnemies = [];
numOfEnemies = 18;

for (i = 0; i < numOfEnemies; i++){
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

var player = new Player(200, 405);

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
