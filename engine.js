/* Engine.js
 * Udacity.com (line 29 Andy Davies)
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on the player and enemy objects (defined in app.js).
 *
 * The game engine works by drawing the entire game screen over and over, presenting
 * the illusion of animation. The engine is available globally via
 * the Engine variable and it also makes the canvas' context (ctx) object
 * globally available to make writing app.js a little simpler to work with.
 *
 */

var Engine = (function(global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime;

    // ANDY
    var highestScore = 0;

        

    canvas.width = 505;
    canvas.height = 606;
    // doc.body.appendChild(canvas);
    // modified to add to portfolio site
    doc.getElementById("game").appendChild(canvas);

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        update(dt);
        render();

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        // ANDY: if seconds <= 0 stop the engine
        if (seconds > 0) {
            win.requestAnimationFrame(main);  
        }
        
    }

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        //reset();
        // set timer to 60
        // seconds in global scope so it can be accessed by timer.update and doesn't have to
        // be passed through several functions
        seconds = 10;
        lastTime = Date.now();

        // initialise collectables
        collectables.forEach(function(collectable) {
            collectable.reset();
        });

        main();
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
    function update(dt) {
        updateEntities(dt);
        // checkCollisions();
    }

    /* ANDY: (note: this function no longer called by init())
     * called when timer reaches zero. Handles end-of-game and restart.
     */
    function reset() {

        // test
        console.log("game over");

        // wait 3 seconds then restart
        var waitTime = 3;
        window.setTimeout(function(){
            init();
            // reset player position
            player.reset();
        }, waitTime * 1000);

        // show score message, pass waitTime so function can access it
        renderFinalScore(waitTime);


    }

    /* This is called by the update function and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to the object. Do your drawing in your
     * render methods.
     */
    function updateEntities(dt) {
        allEnemies.forEach(function(enemy) {
            enemy.update(dt);
        });
        player.update();

        // ANDY: pass reset function to update so it has it in scope for when time=0
        timer.update(dt, reset);

        // ANDY update collectables
        collectables.forEach(function(collectable) {
            collectable.update();
        });
    }

    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render() {
        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */
        var rowImages = [
                'img/water-block.png',   // Top row is water
                'img/stone-block.png',   // Row 1 of 3 of stone
                'img/stone-block.png',   // Row 2 of 3 of stone
                'img/stone-block.png',   // Row 3 of 3 of stone
                'img/grass-block.png',   // Row 1 of 2 of grass
                'img/grass-block.png'    // Row 2 of 2 of grass
            ],
            numRows = 6,
            numCols = 5,
            row, col;

        /* Loop through the number of rows and columns we've defined above
         * and, using the rowImages array, draw the correct image for that
         * portion of the "grid"
         */
        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                /* The drawImage function of the canvas' context element
                 * requires 3 parameters: the image to draw, the x coordinate
                 * to start drawing and the y coordinate to start drawing.
                 * We're using our Resources helpers to refer to our images
                 * so that we get the benefits of caching these images, since
                 * we're using them over and over.
                 */
                ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
            }
        }

       

        renderEntities();
    }

    /* This function is called by the render function and is called on each game
     * tick. Its purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */
    function renderEntities() {
        /* Loop through all of the objects within the allEnemies array and call
         * the render function you have defined.
         */
        allEnemies.forEach(function(enemy) {
            enemy.render();
        });

        player.render();

        // ANDY
        timer.render();

        // ANDY
        collectables.forEach(function(collectable) {
            //console.log(this);
            collectable.render();

        });

        // ANDY
        interimScoreBoard.render();
        totalScoreBoard.render();
    }

    // ANDY:
    function renderFinalScore(waitTime) {

        // display score
        document.getElementById("score_alert").innerHTML = "You scored " + totalScore + " points!";

        // update highest score
        if (totalScore > highestScore) {
            highestScore = totalScore;
        }

        // wait, then clear when game restarts
        window.setTimeout(function(){
            // update highest score
            document.getElementById("score_alert").innerHTML = "Your highest score is " + highestScore;

            // reset scores
            interimScore = 0;
            totalScore = 0;
        }, waitTime * 1000);
    }

    

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
        'img/stone-block.png',
        'img/water-block.png',
        'img/grass-block.png',
        'img/enemy-bug.png',
        'img/char-boy.png',
        'img/Gem Blue.png',
        'img/Gem Orange.png',
        'img/Heart.png'
    ]);
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developers can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;
})(this);


