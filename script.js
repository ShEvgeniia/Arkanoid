class ArkanoidGame {
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
        this.ballVX = 0;
        this.ballVY = 0;
        this.BALL_SPEED = 6;

        this.setupClickHandler();
        this.setupGameLoop();

        this.currentPlayer = 1;
        this.players = {
            1: { score: 0, lives: 3 },
            2: { score: 0, lives: 3 }
        };
        
        this.scoreElement = document.getElementById('score-value');
        this.livesElement = document.getElementById('lives-container');
        this.playerIndicator = document.getElementById('player-indicator');
        this.levelElement = document.getElementById('level-display');
        
        this.level = 1;
        this.levelThreshold = 500;
        
        this.updateHUD();
    }

    createPlatform() {
        const platform = new PIXI.Graphics();
        
        platform.beginFill(0xd0d0d0);
        platform.drawRect(0, 0, this.PLATFORM_WIDTH, this.PLATFORM_HEIGHT);
        platform.endFill();

        const endWidth = 18;
        platform.beginFill(0xcc0000);
        platform.drawRect(0, 0, endWidth, this.PLATFORM_HEIGHT);
        platform.drawRect(this.PLATFORM_WIDTH - endWidth, 0, endWidth, this.PLATFORM_HEIGHT);
        platform.endFill();

        platform.beginFill(0xffffff);
        platform.drawRect(endWidth - 3, 0, 3, this.PLATFORM_HEIGHT);
        platform.drawRect(this.PLATFORM_WIDTH - endWidth, 0, 3, this.PLATFORM_HEIGHT);
        platform.drawRect(0, 0, 3, this.PLATFORM_HEIGHT);
        platform.drawRect(this.PLATFORM_WIDTH - 3, 0, 3, this.PLATFORM_HEIGHT);
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
        const rowColors = [0xCC0000, 0xCC6600, 0xffd400, 0x00AA00, 0x0066CC, 0x9900CC, 0xff00ff, 0x00ffff];

        for (let row = 0; row < this.BRICK_ROWS; row++) {
            for (let col = 0; col < this.BRICK_COLS; col++) {
                const brick = new PIXI.Graphics();
                let color, hp, points;

                if (row === 0) {
                    color = 0xc0c0c0;
                    hp = 2;
                    points = 50;
                } else if (row === 1) {
                    color = rowColors[row];
                    hp = 1;
                    points = 40;
                } else if (row === 2) {
                    color = rowColors[row];
                    hp = 1;
                    points = 30;
                } else {
                    color = rowColors[row];
                    hp = 1;
                    points = 20;
                }

                brick.beginFill(color);
                brick.lineStyle(2, 0x000000, 1);
                brick.drawRect(0, 0, this.BRICK_WIDTH, this.BRICK_HEIGHT);
                brick.endFill();

                brick.x = startX + col * (this.BRICK_WIDTH + this.BRICK_GAP);
                brick.y = this.BRICK_TOP_OFFSET + row * (this.BRICK_HEIGHT + this.BRICK_GAP);
                brick.hp = hp;
                brick.points = points;
                brick.currentColor = color;

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
        ball.scale.y = 0.75;

        this.scene.addChild(ball);
        return ball;
    }

    setupControls() {
        window.addEventListener('mousemove', (event) => {
            this.movePlatform(event);
        });
    }

    movePlatform(event) {
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
            if (this.gameState === 'READY') {
                this.launchBall();
            } else if (this.gameState === 'GAME_OVER' || this.gameState === 'WIN' || this.gameState === 'NEXT_PLAYER') {
                this.resetGame();
            }
        });
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        
        if (this.players[this.currentPlayer].lives <= 0) {
            this.gameOver();
            return false;
        }

        this.resetField();
        
        this.gameState = 'NEXT_PLAYER';
        this.showNextPlayerMessage();
        return true;
    }

    resetField() {
        for (let i = 0; i < this.bricks.length; i++) {
            this.scene.removeChild(this.bricks[i]);
        }

        this.level = 1;
        this.levelThreshold = 500;
        this.BALL_SPEED = 6;
        this.BRICK_ROWS = 6;

        this.bricks = this.createBricks();

        this.ballVX = 0;
        this.ballVY = 0;
        this.stickBallToPlatform();

        this.updateHUD();
    }

    showNextPlayerMessage() {
        this.messageText = new PIXI.Text(`PLAYER ${this.currentPlayer}`, {
            fontFamily: '"Courier New", monospace',
            fontSize: 48,
            fontWeight: 'bold',
            fill: 0xffff00,
            align: 'center',
        });
        this.messageText.anchor.set(0.5);
        this.messageText.x = this.FIELD_WIDTH / 2;
        this.messageText.y = this.FIELD_HEIGHT / 2;
        this.scene.addChild(this.messageText);
    }

    resetGame() {
        if (this.messageText) {
            this.scene.removeChild(this.messageText);
            this.messageText = null;
        }

        if (this.gameState === 'GAME_OVER') {
            this.players[1].score = 0;
            this.players[1].lives = 3;
            this.players[2].score = 0;
            this.players[2].lives = 3;
            this.currentPlayer = 1;
            this.level = 1;
            this.levelThreshold = 500;
            this.BALL_SPEED = 6;
            this.BRICK_ROWS = 6;
        }

        for (let i = 0; i < this.bricks.length; i++) {
            this.scene.removeChild(this.bricks[i]);
        }
        this.bricks = this.createBricks();
        
        this.gameState = 'READY';
        this.ballVX = 0;
        this.ballVY = 0;
        this.stickBallToPlatform();
        this.updateHUD();
    }

    updateHUD() {
        const player = this.players[this.currentPlayer];
        this.scoreElement.textContent = player.score;
        this.playerIndicator.textContent = `PLAYER ${this.currentPlayer}`;
        this.levelElement.textContent = 'ROUND ' + this.level;
        
        this.livesElement.innerHTML = '';
        for (let i = 0; i < player.lives; i++) {
            const miniPlatform = document.createElement('div');
            miniPlatform.className = 'mini-platform';
            this.livesElement.appendChild(miniPlatform);
        }
    }

    launchBall() {
        if (this.gameState === 'NEXT_PLAYER') {
            this.gameState = 'READY';
            if (this.messageText) {
                this.scene.removeChild(this.messageText);
                this.messageText = null;
            }
        }
        this.gameState = 'PLAYING';
        this.ballVX = this.BALL_SPEED;
        this.ballVY = -this.BALL_SPEED;
    }

    setupGameLoop() {
        this.app.ticker.add((delta) => {
            if (this.gameState === 'PLAYING') {
                this.updateBall(delta);
            } else if (this.gameState === 'READY' || this.gameState === 'NEXT_PLAYER') {
                this.stickBallToPlatform();
            }
        });
    }

    stickBallToPlatform() {
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

        const ballBottom = this.ball.y + this.BALL_RADIUS;
        const platformTop = this.PLATFORM_Y;
        const platformLeft = this.platform.x;
        const platformRight = this.platform.x + this.PLATFORM_WIDTH;

        const touchesTop = ballBottom >= platformTop;
        const indexX = this.ball.x >= platformLeft && this.ball.x <= platformRight;

        if (touchesTop && indexX) {
            this.ball.y = platformTop - this.BALL_RADIUS;
            const platformCenter = this.platform.x + this.PLATFORM_WIDTH / 2;
            const hitPosition = (this.ball.x - platformCenter) / (this.PLATFORM_WIDTH / 2);
            this.ballVX = hitPosition * this.BALL_SPEED;
            this.ballVY = -Math.abs(this.ballVY);
        }
    }

    checkBricksCollision() {
        for (let i = 0; i < this.bricks.length; i++) {
            const brick = this.bricks[i];

            const ballLeft = this.ball.x - this.BALL_RADIUS;
            const ballRight = this.ball.x + this.BALL_RADIUS;
            const ballTop = this.ball.y - this.BALL_RADIUS;
            const ballBottom = this.ball.y + this.BALL_RADIUS;

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
                    
                    this.players[this.currentPlayer].score += brick.points;
                    this.updateHUD();
                    this.checkLevelUp();

                    if (this.bricks.length === 0) {
                        this.win();
                        return;
                    }
                } else {
                    brick.alpha = 0.5;
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

    checkLevelUp() {
        if (this.players[this.currentPlayer].score >= this.levelThreshold) {
            this.level++;
            this.levelThreshold += 500;
            this.BALL_SPEED += 1;

            if (this.BRICK_ROWS < 8) {
                this.BRICK_ROWS++;
            }

            for (let i = 0; i < this.bricks.length; i++) {
                this.scene.removeChild(this.bricks[i]);
            }
            this.bricks = this.createBricks();

            this.gameState = 'READY';
            this.ballVX = 0;
            this.ballVY = 0;
            this.stickBallToPlatform();
            this.updateHUD();
        }
    }

    resetBall() {
        this.players[this.currentPlayer].lives -= 1;
        this.updateHUD();

        if (this.players[this.currentPlayer].lives <= 0) {
            if (!this.switchPlayer()) {
                return; 
            }
        } else {
            this.gameState = 'READY';
            this.ballVX = 0;
            this.ballVY = 0;
            this.stickBallToPlatform();
        }
    }

    gameOver() {
        this.gameState = 'GAME_OVER';
        
        let winnerText;
        if (this.players[1].score > this.players[2].score) {
            winnerText = 'PLAYER 1 WINS!';
        } else if (this.players[2].score > this.players[1].score) {
            winnerText = 'PLAYER 2 WINS!';
        } else {
            winnerText = 'DRAW!';
        }
        
        this.messageText = new PIXI.Text(`${winnerText}\n\nP1: ${this.players[1].score}\nP2: ${this.players[2].score}`, {
            fontFamily: '"Courier New", monospace',
            fontSize: 36,
            fontWeight: 'bold',
            fill: 0xffff00,
            align: 'center',
        });
        this.messageText.anchor.set(0.5);
        this.messageText.x = this.FIELD_WIDTH / 2;
        this.messageText.y = this.FIELD_HEIGHT / 2;
        this.scene.addChild(this.messageText);
    }

    win() {
        this.gameState = 'WIN';
        this.messageText = new PIXI.Text(`PLAYER ${this.currentPlayer} WINS!`, {
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