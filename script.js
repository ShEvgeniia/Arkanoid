class ArkanoidGame{
    constructor() {
        this.app = new PIXI.Application({
            width: 800,
            height: 600,
            backgroundAlpha: 0,
            antialias: true,
        });


        document.getElementById('game-container').appendChild(this.app.view);
        this.scene = this.app.stage;

        this.FIELD_WIDTH = 800;
        this.FIELD_HEIGHT = 600;

        this.PLATFORM_WIDTH = 110;
        this.PLATFORM_HEIGHT = 16;
        this.PLATFORM_Y = 560;

        this.BALL_RADIUS = 8;

        this.BRICK_ROWS = 6;
        this.BRICK_COLS = 10;
        this.BRICK_WIDTH = 64;
        this.BRICK_HEIGHT = 22;
        this.BRICK_GAP = 6;
        this.BRICK_TOP_OFFSET = 60;

        this.platform = this.createPlatform();
        this.ball = this.createBall();
        this.bricks = this.createBricks();

        this.setupControls();

        this.gameState = 'READY';

        // скорость мяча
        this.ballVX = 0;
        this.ballVY = 0;

        this.BALL_SPEED = 6;

        this.setupClickHandler();
        this.setupGameLoop();

        this.score = 0;
        this.scoreText = new PIXI.Text('Score: 0', {
            fontFamily: '"Courier New", monospace',
            fontSize: 20,
            fill: 0xffffff,
        });

        this.scoreText.x = 10;
        this.scoreText.y = 10;
        this.scene.addChild(this.scoreText);

        this.lives = 3;

        this.livesText = new PIXI.Text('LIVES: 3', {
            fontFamily: '"Courier New", monospace',
            fontSize: 20,
            fill: 0xffffff,
        });

        this.livesText.x = 10;
        this.livesText.y = 40;
        this.scene.addChild(this.livesText);

        this.level = 1;
        this.levelThreshold = 500;

        this.levelText = new PIXI.Text('LEVEL: 1', {
            fontFamily: '"Courier New", monospace',
            fontSize: 20,
            fontWeight: 'bold',
            fill: 0x00ff00,
        });

        this.levelText.x = 10;
        this.levelText.y = 70;
        this.scene.addChild(this.levelText);

    }

    createPlatform() {
        const platform = new PIXI.Graphics();

        platform.beginFill(0xd0d0d0);
        platform.drawRect(0, 0, this.PLATFORM_WIDTH, this.PLATFORM_HEIGHT);
        platform.endFill();
        

        platform.beginFill(0xffffff);
        platform.drawRect(0, 0, this.PLATFORM_WIDTH, 3);
        platform.endFill();

        const endWidth = 18;
        platform.beginFill(0xcc0000);
        platform.drawRect(0, 0, endWidth, this.PLATFORM_HEIGHT);
        platform.drawRect(this.PLATFORM_WIDTH - endWidth, 0, endWidth, this.PLATFORM_HEIGHT);
        platform.endFill();

        platform.beginFill(0xffffff);
        platform.drawRect(endWidth - 3, 0, 3, this.PLATFORM_HEIGHT); // Левая белая полоска
        platform.drawRect(this.PLATFORM_WIDTH - endWidth, 0, 3, this.PLATFORM_HEIGHT); // Правая белая полоска
        platform.endFill();

        platform.x = this.FIELD_WIDTH / 2 - this.PLATFORM_WIDTH / 2;
        platform.y = this.PLATFORM_Y;

        this.scene.addChild(platform);
        return platform;
    }


    createBricks() {
        const bricks = [];

        const rosWidth = this.BRICK_COLS * this.BRICK_WIDTH + (this.BRICK_COLS - 1) * this.BRICK_GAP;

        const startX = (this.FIELD_WIDTH - rosWidth) / 2;

        const rowColors = [0xff3864, 0xff7b00, 0xffd400, 0x4ade80, 0x38bdf8, 0xa855f7,];
        
        for (let row = 0; row < this.BRICK_ROWS; row++) {
            for (let col = 0; col < this.BRICK_COLS; col++) {
                
                const brick = new PIXI.Graphics();

                let color;
                let hp;
                let points;

                if (row === 0) {
                    color = 0xc0c0c0;
                    hp = 2;
                    points = 50;
                } else  if (row === 1) {
                    color = rowColors[row];
                    hp = 1;
                    points = 40;
                } else  if (row === 2) {
                    color = rowColors[row];
                    hp = 1;
                    points = 30;
                } else {
                    color = rowColors[row];
                    hp = 1;
                    points = 20;
                }

                brick.beginFill(color);
                brick.drawRect(0, 0, this.BRICK_WIDTH, this.BRICK_HEIGHT);
                brick.endFill();

                brick.x = startX + col * (this.BRICK_WIDTH + this.BRICK_GAP) ;
                brick.y = this.BRICK_TOP_OFFSET + row * (this.BRICK_HEIGHT + this.BRICK_GAP);

                brick.hp = hp;
                brick.currentColor = color;
                brick.points = points;

                this.scene.addChild(brick);
                bricks.push(brick);
            }
        }
        return bricks;

    }
    createBall() {
        const ball = new PIXI.Graphics();

        ball.beginFill(0xcccccc);
        ball.drawCircle(0, 0, this.BALL_RADIUS + 1);
        ball.endFill();

        ball.beginFill(0xffffff);
        ball.drawCircle(0, 0, this.BALL_RADIUS - 1);
        ball.endFill();

        ball.x = this.FIELD_WIDTH / 2;
        ball.y = this.PLATFORM_Y - this.BALL_RADIUS - 2;

        ball.scale.y = 0.7;

        this.scene.addChild(ball);
        return ball;
    }

    setupControls() {
        window.addEventListener('mousemove', (event) => {
            this.movePlatform(event);
        });
    }

    movePlatform(){
        const rect = this.app.view.getBoundingClientRect();

        const mouseX = event.clientX - rect.left;

        let newX = mouseX - this.PLATFORM_WIDTH / 2;

        if (newX < 0) {
            newX = 0;
        }
        if (newX > this.FIELD_WIDTH - this.PLATFORM_WIDTH) {
            newX = this.FIELD_WIDTH - this.PLATFORM_WIDTH;
        }

        this.platform.x = newX;
    }

    setupClickHandler() {
        window.addEventListener('click', () => {
            // console.log('FPS:', this.app.ticker.FPS);
            if (this.gameState === 'READY') {
                this.launchBall();
            } else if (this.gameState === 'GAME_OVER' || this.gameState === 'WIN') {
                this.resetGame();
            }
        });
    }

    resetGame() {
        if (this.messageText) {
            this.scene.removeChild(this.messageText);
            this.messageText = null;
        }

        for (let i = 0; i < this.bricks.length; i++) {
            this.scene.removeChild(this.bricks[i]);
        }

        this.level = 1;
        this.levelThreshold = 500;
        this.BALL_SPEED = 6;
        this.BRICK_ROWS = 6;
        this.updateLevelText();

        this.bricks = this.createBricks();
        this.score = 0;
        this.updateScoreText();
        this.lives = 3;
        this.updateLivesText();

        this.gameState = 'READY';
        this.ballVX = 0;
        this.ballVY = 0;
        this.stickBallToPLatform();
    }

    updateLivesText() {
        this.livesText.text = 'LIVES: ' + this.lives;
    }

    launchBall() {
        this.gameState = 'PLAYING';

        this.ballVX = this.BALL_SPEED;
        this.ballVY = -this.BALL_SPEED;
    }

    setupGameLoop() {
        this.app.ticker.add((delta) => {
            if(this.gameState === 'PLAYING') {
                this.updateBall(delta);
            } else if (this.gameState === 'READY') {
                this.stickBallToPLatform();
            }   
        });
    }

    stickBallToPLatform() {
        this.ball.x = this.platform.x + this.PLATFORM_WIDTH / 2;

        this.ball.y = this.PLATFORM_Y - this.BALL_RADIUS - 2;
    }

    updateBall(delta) {
        this.ball.x += this.ballVX * delta;
        this.ball.y += this.ballVY * delta;

        if (this.ball.x - this.BALL_RADIUS < 0) {
            this.ball.x = this.BALL_RADIUS;
            this.ballVX = -this.ballVX;
        }

        if (this.ball.x + this.BALL_RADIUS > this.FIELD_WIDTH) {
            this.ball.x = this.FIELD_WIDTH - this.BALL_RADIUS;
            this.ballVX = -this.ballVX;
        }

        if (this.ball.y - this.BALL_RADIUS < 0) {
            this.ball.y = this.BALL_RADIUS;
            this.ballVY = -this.ballVY;
        }

        this.checkPlatformCollision();

        this.checkBricksCollision();

        if (this.ball.y - this.BALL_RADIUS > this.FIELD_HEIGHT) {
            this.resetBall();
        }


    }

    checkPlatformCollision() {
        if (this.ballVY <= 0) return;

        const ballBottom = this.ball.y + this.BALL_RADIUS; // низ мяча
        const platformTop = this.PLATFORM_Y; // вверх платформы

        const platformLeft = this.platform.x;
        const platformRight = this.platform.x + this.PLATFORM_WIDTH;

        const touchesTop = ballBottom >= platformTop;
        const indexX = this.ball.x >= platformLeft && this.ball.x <= platformRight;

        if (touchesTop && indexX) {
            this.ball.y = platformTop - this.BALL_RADIUS;

            const pltformCenter = this.platform.x + this.PLATFORM_WIDTH / 2;
            const hisPosition = (this.ball.x - pltformCenter) / (this.PLATFORM_WIDTH / 2);

            this.ballVX = hisPosition * this.BALL_SPEED;
            this.ballVY = -Math.abs(this.ballVY);
        }
    }

    checkBricksCollision() {
        for (let i = 0; i < this.bricks.length; i++) {
            const brick = this.bricks[i];

            // прямоугольник мяча
            const ballLeft = this.ball.x - this.BALL_RADIUS;
            const ballRight = this.ball.x + this.BALL_RADIUS;
            const ballTop = this.ball.y - this.BALL_RADIUS;
            const ballBottom = this.ball.y + this.BALL_RADIUS;
            
            // прямоугольник кирпича
            const brickLeft = brick.x;
            const brickRight = brick.x + this.BRICK_WIDTH;
            const brickTop = brick.y;
            const brickBottom = brick.y + this.BRICK_HEIGHT;

            const hitX = ballRight > brickLeft && ballLeft < brickRight;
            const hitY = ballBottom > brickTop && ballTop < brickBottom;

            if (hitX && hitY) {

                brick.hp -= 1;

                if (brick.hp <= 0) {
                    this.scene.removeChild(brick);
                    this.bricks.splice(i, 1);
                    this.score += brick.points;
                    this.updateScoreText();

                    this.checkLevelUp();

                    if (this.bricks.length === 0) {
                        this.win();
                        return;
                    }
                } else {
                    brick.alpha = 0.5
                }

                const overlapX = Math.min(ballRight, brickRight) - Math.max(ballLeft, brickLeft);
                const overlapY = Math.min(ballBottom, brickBottom) - Math.max(ballTop, brickTop);

                if (overlapX < overlapY) {
                    this.ballVX = -this.ballVX;
                } else {
                    this.ballVY = -this.ballVY;
                }
                break;
            }
        }
    }

    updateScoreText() {
        this.scoreText.text = 'SCORE: ' + this.score;
    }

    checkLevelUp() {
        if (this.score >= this.levelThreshold) {
            this.level++;
            this.levelThreshold += 500;
            this.BALL_SPEED += 1;

            this.updateLevelText();

            if (this.BRICK_ROWS < 8) {
                this.BRICK_ROWS++;
            }

            for(let i = 0; i < this.bricks.length; i++) {
                this.scene.removeChild(this.bricks[i]);
            }
            this.bricks = this.createBricks();

            this.gameState = 'READY';
            this.ballVX = 0;
            this.ballVY = 0;
            this.stickBallToPLatform();
        }
    }

    updateLevelText() {
        this.levelText.text = 'LEVEL: ' + this.level;
    }

    resetBall() {

        this.lives -= 1;
        this.updateLivesText();

        if (this.lives <= 0) {
            this.gameOver();
            return;
        }
        this.gameState = 'READY';
        this.ballVX = 0;
        this.ballVY = 0;
        this.stickBallToPLatform();
    }

    gameOver() {
        this.gameState = 'GAME_OVER';

        this.messageText = new PIXI.Text('GAME OVER\n\nКлик - заново', {
            fontFamily: '"Courier New", monospace',
            fontSize: 48,
            fontWeight: 'bold',
            fill: 0xff3864,
            align: 'center',
        });
        this.messageText.anchor.set(0.5);
        this.messageText.x = this.FIELD_WIDTH / 2;
        this.messageText.y = this.FIELD_HEIGHT / 2;

        this.scene.addChild(this.messageText);
    }

    win() {
        this.gameState = 'WIN';

        this.messageText = new PIXI.Text('ПОБЕДА!\n\nКлик - заново', {
            fontFamily: '"Courier New", monospace',
            fontSize: 48,
            fontWeight: 'bold',
            fill: 0x4ade80,
            align: 'center',
        });
        this.messageText.anchor.set(0.5);
        this.messageText.x = this.FIELD_WIDTH / 2;
        this.messageText.y = this.FIELD_HEIGHT / 2;

        this.scene.addChild(this.messageText);
    }

}
window.addEventListener('load', () => {
    new ArkanoidGame();
});