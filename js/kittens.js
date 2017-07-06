// This sectin contains some game constants. It is not super interesting
var GAME_WIDTH = 375;
var GAME_HEIGHT = 500;

var ENEMY_WIDTH = 75;
var ENEMY_HEIGHT = 156;
var MAX_ENEMIES = 3;
var MAX_COINS = 1;

var PLAYER_WIDTH = 75;
var PLAYER_HEIGHT = 54;

// These two constants keep us from using "magic numbers" in our code
var LEFT_ARROW_CODE = 37;
var RIGHT_ARROW_CODE = 39;

// These two constants allow us to DRY
var MOVE_LEFT = 'left';
var MOVE_RIGHT = 'right';
var SPACE_BAR = 32;

var audio = new Audio("bowser_song.mp3");
audio.play();

// Preload game images
var images = {};
['mario.png', 'luigi.png', 'castle.png', 'Thwomp.png', 'star.png', 'yoshi_coin.png'].forEach(imgName => {
    var img = document.createElement('img');
    img.src = 'images/' + imgName;
    images[imgName] = img;
});



// This section is where you will be doing most of your coding

class Entity {
    render(ctx) {
        ctx.drawImage(this.sprite, this.x, this.y);
    }
}

class Enemy extends Entity {
    constructor(xPos) {
        super();
        this.x = xPos;
        this.y = -ENEMY_HEIGHT;
        this.sprite = images['Thwomp.png'];

        // Each enemy should have a different speed
        this.speed = Math.random() / 2 + 0.25;
    }

    update(timeDiff) {
        this.y = this.y + timeDiff * this.speed;
    }
}

class Star extends Entity {
    constructor(xPos) {
        super();
        this.x = xPos;
        this.y = -ENEMY_HEIGHT;
        this.sprite = images['star.png'];

        // Each star should have a different speed
        this.speed = Math.random() / 2 + 0.25;
    }

    update(timeDiff) {
        this.y = this.y + timeDiff * this.speed;
    }
}

class Coin extends Entity {
        constructor(xPos) {
        super();
        this.x = xPos;
        this.y = -ENEMY_HEIGHT;
        this.sprite = images['yoshi_coin.png'];

        // Each coin should have a different speed
        this.speed = Math.random() / 2 + 0.25;
    }

    update(timeDiff) {
        this.y = this.y + timeDiff * this.speed;
    }
}

class Player extends Entity {
    constructor() {
        super();
        this.x = 2 * PLAYER_WIDTH;
        this.y = GAME_HEIGHT - PLAYER_HEIGHT - 10;
        this.sprite = images['mario.png'];
    }

    // This method is called by the game engine when left/right arrows are pressed
    move(direction) {
        if (direction === MOVE_LEFT && this.x > 0) {
            this.x = this.x - PLAYER_WIDTH;
        }
        else if (direction === MOVE_RIGHT && this.x < GAME_WIDTH - PLAYER_WIDTH) {
            this.x = this.x + PLAYER_WIDTH;
        }
    }
}





/*
This section is a tiny game engine.
This engine will use your Enemy and Player classes to create the behavior of the game.
The engine will try to draw your game at 60 frames per second using the requestAnimationFrame function
*/
class Engine {
    constructor(element) {
        // Setup the player
        this.player = new Player();

        // Setup enemies, making sure there are always three
        this.setupEnemies();
        // Setup coin, make sure there is always one
        this.setupCoin();
        // Setup star, make sure there is always one
        this.setupStar();

        // Setup the <canvas> element where we will be drawing
        var canvas = document.createElement('canvas');
        canvas.width = GAME_WIDTH;
        canvas.height = GAME_HEIGHT;
        element.appendChild(canvas);

        this.ctx = canvas.getContext('2d');

        // Since gameLoop will be called out of context, bind it once here.
        this.gameLoop = this.gameLoop.bind(this);
    }

    /*
     The game allows for 5 horizontal slots where an enemy can be present.
     At any point in time there can be at most MAX_ENEMIES enemies otherwise the game would be impossible
     */
    setupEnemies() {
        if (!this.enemies) {
            this.enemies = [];
        }
        while (this.enemies.filter(e => !!e).length < MAX_ENEMIES) {
            this.addEnemy();
        }
    }
    

    // Puts enemy in empty lane
    addEnemy() {
        var enemySpots = GAME_HEIGHT / ENEMY_WIDTH;

        var enemySpot;
        // Keep looping until we find a free enemy spot at random
        while (enemySpot === undefined && this.enemies[enemySpot]) {
            enemySpot = Math.floor(Math.random() * enemySpots);
        }
        this.enemies[enemySpot] = new Enemy(enemySpot * ENEMY_WIDTH);
    }
    
    setupStar() {
        if (!this.star) {
            this.star = [];
        }
        while (this.star.filter(e => !!e).length < MAX_COINS) {
            this.addStar();
        }
    }
    
    
    addStar() {
        var starSpots = GAME_HEIGHT / ENEMY_WIDTH;
        var starSpot;
        while (!starSpot && this.star[starSpot]) {
            starSpot = Math.floor(Math.random() * starSpots);
        }
        this.star[starSpot] = new Star(starSpot * ENEMY_WIDTH);
    }
    
    setupCoin() {
        if (!this.coin) {
            this.coin = [];
        }
        while (this.coin.filter(e => !!e).length < MAX_COINS) {
            this.addCoin();
        }
    }

    
    addCoin() {
        var coinSpots = GAME_HEIGHT / ENEMY_WIDTH;
        var coinSpot;
        while (!coinSpot && this.coin[coinSpot]) {
            coinSpot = Math.floor(Math.random() * coinSpots);
        }
        this.coin[coinSpot] = new Coin(coinSpot * ENEMY_WIDTH);
    }
    
    start() {
        this.score = 0;
        this.starShield = 0;
        this.lastFrame = Date.now();

        // Listen for keyboard left/right and update the player
        document.addEventListener('keydown', e => {
               
            if (e.keyCode === LEFT_ARROW_CODE) {
                this.player.move(MOVE_LEFT);
            }
            else if (e.keyCode === RIGHT_ARROW_CODE) {
                this.player.move(MOVE_RIGHT);
            }
        });

        this.gameLoop();
    }

    /*This is the core of the game engine. The `gameLoop` function gets called ~60 times per second
    During each execution of the function, we will update the positions of all game entities
    It's also at this point that we will check for any collisions between the game entities
    Collisions will often indicate either a player death or an enemy kill

    In order to allow the game objects to self-determine their behaviors, gameLoop will call the `update` method of each entity
    To account for the fact that we don't always have 60 frames per second, gameLoop will send a time delta argument to `update`
    You should use this parameter to scale your update appropriately*/
     
    
     
    gameLoop() {
        // Check how long it's been since last frame
        var currentFrame = Date.now();
        var timeDiff = currentFrame - this.lastFrame;


        // Increase the score!
        this.score += timeDiff;

        // Call update on all enemies
        this.enemies.forEach(enemy => enemy.update(timeDiff));
        
        // Call update on coin
        this.coin.forEach(coin => coin.update(timeDiff));
        
        // Call update on star
        this.star.forEach(star => star.update(timeDiff));

        // Draw everything!
        this.ctx.drawImage(images['castle.png'], 0, 0); // draw the star bg
        this.enemies.forEach(enemy => enemy.render(this.ctx)); // draw the enemies
        this.coin.forEach(coin => coin.render(this.ctx)); // draw the coin
        this.star.forEach(star => star.render(this.ctx)); // draw the star
        this.player.render(this.ctx); // draw the player
        

        // Check if any enemies should die
        this.enemies.forEach((enemy, enemyIdx) => {
            if (enemy.y > GAME_HEIGHT) {
                delete this.enemies[enemyIdx];
            }
        });
        
        this.setupEnemies();
        
        // Check if any coin should disappear
        this.coin.forEach((coin, coinIdx) => {
            if (coin.y > GAME_HEIGHT) {
                delete this.coin[coinIdx];
            }
        });
    
        
        this.setupCoin();
        
        // Check if any star should disappear
        this.star.forEach((star, starIdx) => {
            if (star.y > GAME_HEIGHT) {
                delete this.star[starIdx];
            }
        });
    
        this.setupStar();

        // Check if player is dead
        if (this.isPlayerDead()) {
            // If they are dead, then it's game over!
            this.ctx.font = 'bold 30px Impact';
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillText("Points: " + this.score, 30, 30);
            this.ctx.fillText('Hit "space bar"', 150, 150);
            this.ctx.fillText('to try again!', 160, 200);
            document.addEventListener('keydown', e => {
                if(e.keyCode === SPACE_BAR){
                    
                    window.location.reload();
                    
                    // this.start();
                    // this.player = new Player();
                    // this.enemies = [];
                    // this.setupEnemies();
                }
            });
        }
        else {
            // If player is not dead, then draw the score
            this.ctx.font = 'bold 20px Impact';
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillText("Star Shield: " + this.starShield, 30, 30);
            this.ctx.fillText("Points: " + this.score, 30, 60);


            // Set the time marker and redraw
            this.lastFrame = Date.now();
            requestAnimationFrame(this.gameLoop);
        }
        
        // Check if player collected coin
        if (this.coinCollect()) {
            // If collected coin, increase points!
            this.score += 5000;
        }
        
        // Check if starShield should be added
        if (this.starCollect()) {
            this.starShield += 25;
        }
        
        
        // Check if hardmore should be enabled
        if (this.hardMode()) {
            MAX_ENEMIES = 4;
        }
        
        //Check if luigi should be unlocked
        if (this.unlockLuigi()) {
                this.player.sprite = images['luigi.png']; 
        }
        
    }

    isPlayerDead() {
        // TODO: fix this function!
        var dead = false;
        for (var i=0; i<this.enemies.length; i++) {
            
            if (this.enemies[i] 
                && this.player.x === this.enemies[i].x
                && this.enemies[i].y + ENEMY_HEIGHT - 20 > this.player.y)
                {
                    this.starShield -= 1000;
                    
                    if (this.starShield <= 0) {
                    var audio = new Audio("mario_dead.mp3");
                    audio.play();
                    dead = true
                    }
                }
        }
        return dead;
    }

    coinCollect() {
        var collect = false;
        for (var i=0; i<this.coin.length; i++) {
            
            if (this.coin[i] 
                && this.player.x === this.coin[i].x
                && this.coin[i].y + ENEMY_HEIGHT - 20 > this.player.y)
                {
                    var audio = new Audio("coin_collect.mp3");
                    audio.play();
                    collect = true;
                }
        }
        return collect;
    }
    
    //return true if player touching star
    starCollect() {
        var collect = false;
        for (var i=0; i<this.star.length; i++) {
            
            if (this.star[i] 
                && this.player.x === this.star[i].x
                && this.star[i].y + ENEMY_HEIGHT - 20 > this.player.y
                && this.starShield <= 5000)
                {
                    collect = true;
                }
        }
        return collect;
    }
    
    hardMode() {
        var increaseDifficulty = false;
        if (this.score > 1000000 && this.score < 1010000) {
            var audio = new Audio("bowser_laugh.mp3");
            audio.play();
            increaseDifficulty = true;
        }
        return increaseDifficulty;
    }
    
    unlockLuigi() {
        var unlockedLuigi = false;
        if (this.score > 1500000 && this.score < 1510000) {
            var audio = new Audio("luigi_voice.mp3");
            audio.play();
            unlockedLuigi = true;
        }
        return unlockedLuigi;
    }
    
}

// This section will start the game
var gameEngine = new Engine(document.getElementById('app'));
gameEngine.start();