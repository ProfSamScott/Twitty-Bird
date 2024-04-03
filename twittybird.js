/* Twitty Bird, (c) Sam Scott, 2014
 * http://www-acad.sheridancollege.ca/staff/scottsam
 */
(function() {
    function twittybird() {
        var flapSound = new Audio("sounds/164679flap.mp3");
        flapSound.load();
        var buttonSound = flapSound;
        var tweetSound = new Audio("sounds/31384tweet.mp3");
        tweetSound.load();
        var ouchSound = new Audio("sounds/9874ouch.mp3");
        ouchSound.load();
        var deadBirdSound = new Audio("sounds/57271deadbird.mp3");
        deadBirdSound.load();
        var ambientSound = new Audio("sounds/85138ambience.mp3");
        setTimeout(function() {
            ambientSound.load();
            ambientSound.loop = true;
            ambientSound.play();
        }, 1000);

        var sb = new ScoreBoard();
        var bird = new Bird();
        var screenScaleFactor = 2.5;
        var c = document.getElementById("canvas1");
        var ctx = c.getContext("2d");

        function ScoreBoard() {
            this.count = 0;
            this.score = 0;
            this.bgx = 0;
            this.bgnum = 0;
            this.gameOn = true;
            this.newPipeCount = 250;
            this.pipes = new Array();
            this.timer;
            this.width = 1024;
            this.height = 680;
            this.auto = false;
            this.loadingtags = false;
            this.hashtags = new Array("#TwittyBird");
            this.nexttag = 0;
            this.history = new Array();
            this.helpSize = 40;
            this.helpVisible = false;
            this.warning = true;
        }

        function newBG() {
            var oldbgnum = sb.bgnum;
            do {
                sb.bgnum = parseInt(Math.random() * 6) + 1;
            } while (sb.bgnum === oldbgnum);
            bgImage = new Image();
            bgImage.src = "images/" + sb.bgnum + ".jpg";
        }

        function init() {
            sb.history = new Array("#TwittyBird", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "");
            bird = new Bird();
            sb.score = 0;
            sb.gameOn = true;
            sb.newPipeCount = 250;
            sb.bgx = 0;
            sb.count = 0;
            sb.pipes = new Array();
            newBG();
            getTags();
            clearTimeout(sb.timer);
            sb.timer = setInterval(game, 16);
        }

        function Bird() {
            var wingcounter = 0;
            var scale = 0.2 * screenScaleFactor;
            var x = sb.width / 2 - 100 * scale;
            var y;
            if (sb.warning)
                y = sb.height * .9 - 100 * scale;
            else
                y = sb.height / 2 - 100 * scale;
            var yspeed = 0;
            var gravity = 0.4 * screenScaleFactor;
            var dead = false;
            var active = false;
            var lives = 3;
            var collrad = 1500;
            var colly, collx;
            var firstTimeLanded = false;
            var autoCount = 20;
            this.isAlive = function() {
                return !dead;
            };

            this.isOnGround = function() {
                return y >= sb.height - 200 * scale;
            };
            this.isActive = function() {
                return active;
            };
            this.autoMove = function() {
                autoCount--;
                if (autoCount <= 0) {
                    var closest = -1;
                    var cdist = 100000;
                    for (var i = 0; i < sb.pipes.length; i++)
                        if (sb.pipes[i])
                            if (x < sb.pipes[i].getBackX())
                                if (closest === -1) {
                                    closest = i;
                                    cdist = sb.pipes[i].getBackX() - x;
                                } else if (sb.pipes[i].getBackX() - x < cdist) {
                                    closest = i;
                                    cdist = sb.pipes[i].getBackX() - x;
                                }
                    var flapPoint;
                    if (closest === -1)
                        flapPoint = sb.height / 2;
                    else
                        flapPoint = sb.pipes[closest].getOpeningBottom();
                    flapPoint -= Math.random() * 40 - 10;
                    if ((y + 200 * scale) >= flapPoint - 5 * screenScaleFactor)
                        this.flap();
                }
            };
            this.move = function() {
                if (active) {
                    y += yspeed;
                    yspeed += gravity;
                    if (y > sb.height - 200 * scale) {
                        y = sb.height - 200 * scale;
                        if (!firstTimeLanded) {
                            deadBirdSound.load();
                            deadBirdSound.play();
                            colly = y + (200 * scale);
                            collx = x + (100 * scale);
                            collrad = 0;
                            firstTimeLanded = true;
                        }
                        this.die();
                    }
                }
            };
            this.flap = function() {
                if (active === false) {
                    active = true;
                    newPipe();
                }
                if (sb.auto)
                    autoCount = 20;
                if (!dead) {
                    if (!sb.auto) {
                        flapSound.load();
                        flapSound.play();
                    }
                    yspeed = -6 * screenScaleFactor;
                    wingcounter = 9;
                }
            };
            this.die = function() {
                if (!dead) {
                    message = "#DeadBird";
                    messageAlpha = 1;
                    for (var i = sb.history.length - 1; i > 0; i--)
                        sb.history[i] = sb.history[i - 1];
                    sb.history[0] = message;
                    clearTimeout(sb.tagtimer);
                    setTimeout(function() {
                        sb.pipes = new Array();
                        sb.newPipeCount = 250;
                        sb.auto = true;
                        bird = new Bird();
                        for (var i = sb.history.length - 1; i > 0; i--)
                            sb.history[i] = "";
                        sb.history[0] = "#TwittyBird";

                    }, 5000);
                }
                dead = true;
                lives = 0;
                sb.gameOn = false;
            };
            this.reset = function() {
                x = 190;
                lives = 3;
                yspeed = 0;
                active = false;
                dead = false;
            };

            var message = "#LetsGoTwittyBird";
            if (sb.auto || sb.warning)
                message = "#TwittyBird";
            else
                sb.history[0] = message;
            var messageAlpha = 1.0;
            this.draw = function() {
                // DRAW THE COLLISION CIRCLE
//                    ctx.beginPath();
//                    ctx.lineWidth = 1 * scale;
//                    ctx.arc(101 * scale + x, 101 * scale + y, 100 * scale, 0, Math.PI * 2);
//                    ctx.strokeStyle = "white";
//                    ctx.stroke();
                wingcounter++;
                if (dead || wingcounter % 20 < 10) {
                    //beak - wing up
                    ctx.beginPath();
                    ctx.moveTo(160 * scale + x, 40 * scale + y);
                    ctx.lineTo(200 * scale + x, 80 * scale + y);
                    ctx.lineTo(145 * scale + x, 80 * scale + y);
                    ctx.closePath();
                    ctx.fillStyle = "orange";
                    ctx.fill();
                    ctx.strokeStyle = "black";
                    ctx.lineWidth = 4 * scale;
                    ctx.stroke();

                    // head - wing up
                    ctx.beginPath();
                    ctx.arc(145 * scale + x, 60 * scale + y, 40 * scale, 0, Math.PI * 2);
                    ctx.fillStyle = "rgb(64,64,192)";
                    ctx.fill();
                    ctx.strokeStyle = "black";
                    ctx.lineWidth = 8 * scale;
                    ctx.stroke();

                    ctx.beginPath();
                    if (dead) {
                        ctx.moveTo(155 * scale + x, 40 * scale + y);
                        ctx.lineTo(175 * scale + x, 60 * scale + y);
                        ctx.moveTo(175 * scale + x, 40 * scale + y);
                        ctx.lineTo(155 * scale + x, 60 * scale + y);
                        ctx.lineWidth = 8 * scale;
                        ctx.strokeStyle = "rgb(128,0,0)";
                        ctx.stroke();
                    } else {
                        ctx.arc(165 * scale + x, 50 * scale + y, 7 * scale, 0, Math.PI * 2);
                        ctx.fillStyle = "black";
                        ctx.fill();
                    }
                } else {
                    //beak - wing down
                    ctx.beginPath();
                    ctx.moveTo(120 * scale + x, 20 * scale + y);
                    ctx.lineTo(160 * scale + x, 60 * scale + y);
                    ctx.lineTo(105 * scale + x, 60 * scale + y);
                    ctx.closePath();
                    ctx.fillStyle = "orange";
                    ctx.fill();
                    ctx.strokeStyle = "black";
                    ctx.lineWidth = 4 * scale;
                    ctx.stroke();

                    // head - wing down
                    ctx.beginPath();
                    ctx.arc(105 * scale + x, 40 * scale + y, 40 * scale, 0, Math.PI * 2);
                    ctx.fillStyle = "rgb(64,64,192)";
                    ctx.fill();
                    ctx.strokeStyle = "black";
                    ctx.lineWidth = 8 * scale;
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.arc(125 * scale + x, 30 * scale + y, 7 * scale, 0, Math.PI * 2);
                    ctx.fillStyle = "black";
                    ctx.fill();

                }
                // feet
                ctx.beginPath();
                ctx.moveTo(76 * scale + x, 118 * scale + y);
                ctx.lineTo(156 * scale + x, 168 * scale + y);
                ctx.lineTo(176 * scale + x, 158 * scale + y);
                ctx.moveTo(156 * scale + x, 168 * scale + y);
                ctx.lineTo(152 * scale + x, 188 * scale + y);
                ctx.moveTo(156 * scale + x, 168 * scale + y);
                ctx.lineTo(168 * scale + x, 175.5 * scale + y);
                ctx.moveTo(76 * scale + x, 118 * scale + y);
                ctx.lineTo(115 * scale + x, 190 * scale + y);
                ctx.lineTo(135 * scale + x, 185 * scale + y);
                ctx.moveTo(115 * scale + x, 190 * scale + y);
                ctx.lineTo(100 * scale + x, 200 * scale + y);
                ctx.moveTo(115 * scale + x, 190 * scale + y);
                ctx.lineTo(121 * scale + x, 200 * scale + y);
                ctx.lineWidth = 8 * scale;
                ctx.strokeStyle = "black";
                ctx.stroke();
                ctx.lineWidth = 5 * scale;
                ctx.strokeStyle = "orange";
                ctx.stroke();

                if (dead || wingcounter % 20 < 10) {
                    //body - wing up
                    ctx.beginPath();
                    ctx.arc(71 * scale + x, 113 * scale + y, 70 * scale, 0, Math.PI * 2);
                    ctx.fillStyle = "rgb(0,0,192)";
                    ctx.fill();
                    ctx.strokeStyle = "black";
                    ctx.lineWidth = 8 * scale;
                    ctx.stroke();
                } else {
                    // body - wing down
                    ctx.beginPath();
                    ctx.arc(76 * scale + x, 118 * scale + y, 70 * scale, 0, Math.PI * 2);
                    ctx.fillStyle = "rgb(0,0,192)";
                    ctx.fill();
                    ctx.strokeStyle = "black";
                    ctx.lineWidth = 8 * scale;
                    ctx.stroke();
                }

                if (dead || wingcounter % 20 < 10) {
                    // wing up
                    ctx.beginPath();
                    ctx.moveTo(96 * scale + x, 78 * scale + y);
                    ctx.bezierCurveTo(76 * scale + x, -30 * scale + y, -30 * scale + x, 18 * scale + y, 36 * scale + x, 138 * scale + y);
                    ctx.fillStyle = "rgb(64,64,192)";
                    ctx.closePath();
                    ctx.fill();
                    ctx.strokeStyle = "black";
                    ctx.lineWidth = 8 * scale;
                    ctx.stroke();
                } else {
                    // wing down
                    ctx.beginPath();
                    ctx.moveTo(96 * scale + x, 78 * scale + y);
                    ctx.bezierCurveTo(150 * scale + x, 170 * scale + y, 0 * scale + x, 238 * scale + y, 36 * scale + x, 138 * scale + y);
                    ctx.closePath();
                    ctx.fillStyle = "rgb(64,64,192)";
                    ctx.fill();
                    ctx.strokeStyle = "black";
                    ctx.lineWidth = 8 * scale;
                    ctx.stroke();
                }

                if (collrad < 1500) {
                    ctx.fillStyle = "rgba(255,0,0," + Math.min(1, 1 / (collrad / 300 + 1)) + ")";
                    ctx.beginPath();
                    ctx.arc(collx, colly, collrad, 0, Math.PI * 2);
                    ctx.fill();
                    collrad += 15;
                } else if (dead) {
                    ctx.fillStyle = "rgba(255,0,0," + Math.min(1, 1 / (collrad / 300 + 1)) + ")";
                    ctx.beginPath();
                    ctx.arc(collx, colly, collrad, 0, Math.PI * 2);
                    ctx.fill();
                }

                // talk box
                ctx.font = "bold " + 40 * scale + "px monospace";
                var length = ctx.measureText(message).width;
                ctx.beginPath();
                ctx.moveTo(165 * scale + x, -20 * scale + y);
                ctx.lineTo(165 * scale + x, -70 * scale + y);
                ctx.quadraticCurveTo(115 * scale + x, -70 * scale + y, 115 * scale + x, -120 * scale + y);
                ctx.quadraticCurveTo(115 * scale + x, -170 * scale + y, 165 * scale + x, -170 * scale + y);
                // 165+length = 665
                ctx.lineTo(165 * scale + x + length, -170 * scale + y);
                ctx.quadraticCurveTo(215 * scale + x + length, -170 * scale + y, 215 * scale + x + length, -120 * scale + y);
                ctx.quadraticCurveTo(215 * scale + x + length, -70 * scale + y, 165 * scale + x + length, -70 * scale + y);
                ctx.lineTo(210 * scale + x, -70 * scale + y);
                ctx.closePath();
                ctx.lineWidth = 10 * scale;
                ctx.fillStyle = "rgba(255,255,255," + messageAlpha + ")";
                ctx.fill();
                ctx.strokeStyle = "rgba(0,0,0," + messageAlpha + ")";
                ctx.stroke();
                ctx.fillStyle = "rgba(0,0,0," + messageAlpha + ")";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(message, 165 * scale + x + length / 2, -120 * scale + y);
                messageAlpha -= 0.01;
                if (messageAlpha < 0)
                    messageAlpha = 0;
            };
            this.crash = function(pipe) {
                if (!pipe.isCrashed() && pipe.intersect(101 * scale + x, 101 * scale + y, 100 * scale)) {
                    if (!sb.auto && bird.isAlive()) {
                        ouchSound.load();
                        ouchSound.play();
                    }
                    pipe.crash();
                    return true;
                }
                return false;
            };
            this.pastX = function(xcheck) {
                if (x > xcheck)
                    return true;
                return false;
            };
            this.loseLife = function() {
                if (sb.auto || !dead) {
                    message = "#!%@$*@&!";
                    messageAlpha = 1;
                }
                if (!sb.auto) {
                    if (lives === 1)
                        this.die();
                    if (lives > 0)
                        lives--;
                }
            };
            // returns true if this pipe should score
            this.gainLife = function() {
                //console.log("gain " + lives);
                if (lives < 3) {
                    lives++;
                    return true; // used to return false
                }
                return true;
            };
            this.numLives = function() {
                return lives;
            };
            this.tweet = function() {
                if (!sb.auto) {
                    tweetSound.load();
                    tweetSound.play();
                    message = sb.hashtags[sb.nexttag];
                    sb.nexttag = (sb.nexttag + 1) % sb.hashtags.length;
                    for (var i = sb.history.length - 1; i > 0; i--)
                        sb.history[i] = sb.history[i - 1];
                    sb.history[0] = message;
                }
                else
                    message = "#TapToPlay";
                messageAlpha = 1;
            };
        }

        function Pipe() {
            var openingHeight = 100 * screenScaleFactor;
            var x = sb.width;
            var y = Math.random() * (sb.height - (openingHeight + 10 * screenScaleFactor)) + (openingHeight + 10 * screenScaleFactor) / 2;
            var width = 20 * screenScaleFactor;
            var scored = false;
            var crash = false;
            var collx = -1, colly = -1;
            var collrad = 20 * screenScaleFactor;
            this.draw = function() {
                if (scored)
                    ctx.fillStyle = "rgb(0,128,0)";
                else if (crash)
                    ctx.fillStyle = "rgb(128,0,0)";
                else
                    ctx.fillStyle = "rgb(192,128,0)";
                ctx.strokeStyle = "black";
                ctx.lineWidth = 2 * screenScaleFactor;
                ctx.fillRect(x, 0, width, y - openingHeight / 2);
                ctx.strokeRect(x, -100, width, y - openingHeight / 2 + 100);
                ctx.fillRect(x, y + openingHeight / 2, width, sb.height - y + openingHeight / 2);
                ctx.strokeRect(x, y + openingHeight / 2, width, sb.height - y + openingHeight / 2);
                if (collrad < 50 * screenScaleFactor) {
                    ctx.strokeStyle = "rgba(255,0,0," + Math.min(1, 1 / (collrad / 4 + 1)) + ")";
                    ctx.lineWidth = 5 * screenScaleFactor;
                    ctx.beginPath();
                    ctx.arc(collx, colly, collrad, 0, Math.PI * 2);
                    ctx.stroke();
                    collrad++;
                }
            };
            this.move = function() {
                x -= screenScaleFactor;
                collx -= screenScaleFactor;
            };
            this.alive = function() {
                if (x < -1 * width)
                    return false;
                return true;
            };
            this.intersect = function(centerx, centery, radius) {
                //radius -= 2; //fudge factor
                if (centery > y + openingHeight / 2 || centery < y - openingHeight / 2) {
                    if (centerx + radius > x && centerx - radius < x) {
                        collx = x;
                        colly = centery;
                        collrad = 0;
                        return true;
                    }
                    if (centerx + radius > x + width && centerx - radius < x + width) {
                        collx = x + width;
                        colly = centery;
                        collrad = 0;
                        return true;
                    }
                }
                var xdist = centerx - x;
                var ydist = centery - (y + openingHeight / 2);
                if (Math.sqrt(xdist * xdist + ydist * ydist) < radius) {
                    collx = x;
                    colly = y + openingHeight / 2;
                    collrad = 0;
                    return true;
                }
                xdist = centerx - x;
                ydist = centery - (y - openingHeight / 2);
                if (Math.sqrt(xdist * xdist + ydist * ydist) < radius) {
                    collx = x;
                    colly = y - openingHeight / 2;
                    collrad = 0;
                    return true;
                }
                xdist = centerx - (x + width);
                ydist = centery - (y + openingHeight / 2);
                if (Math.sqrt(xdist * xdist + ydist * ydist) < radius) {
                    collx = x + width;
                    colly = y + openingHeight / 2;
                    collrad = 0;
                    return true;
                }
                xdist = centerx - (x + width);
                ydist = centery - (y - openingHeight / 2);
                if (Math.sqrt(xdist * xdist + ydist * ydist) < radius) {
                    collx = x + width;
                    colly = y - openingHeight / 2;
                    collrad = 0;
                    return true;
                }
//                    if (left >= x && left <= x + width ||
//                            right >= x && right <= x + width ||
//                            left < x && right > x + width)
//                        if (top < y - openingHeight / 2 || bottom > y + openingHeight / 2)
//                            return true;
                return false;
            };
            this.score = function(bird) {
                if (scored)
                    return 0;
                if (bird.pastX(x + width)) {
                    scored = true;
                    if (bird.isAlive()) {
                        return 1;
                    } else
                        return 0;
                }
                return 0;
            };
            this.crash = function() {
                crash = true;
            };
            this.isCrashed = function() {
                return crash;
            };
            this.getBackX = function() {
                return x + width;
            };
            this.getOpeningBottom = function() {
                return y + openingHeight / 2;
            };
        }

        function newPipe() {
            var i = 0;
            while (sb.pipes[i])
                i++;
            //console.log(i);
            sb.pipes[i] = new Pipe();
            sb.count = 0;
            if (!sb.auto)
                sb.newPipeCount *= 0.95;
            if (sb.newPipeCount < 100)
                sb.newPipeCount = 100;
        }

        function game() {
            if (sb.auto)
                bird.autoMove();
            bird.move();

            for (var i = 0; i < sb.pipes.length; i++)
                if (sb.pipes[i])
                    if (sb.pipes[i].alive()) {
                        sb.pipes[i].move();
                        if (bird.crash(sb.pipes[i])) {
                            bird.loseLife();
                        }
                    } else
                        sb.pipes[i] = undefined;
            if (sb.count >= sb.newPipeCount && bird.isActive())
                newPipe();
            sb.count++;

            sb.bgx -= 0.5;//* window.innerWidth / 1024;
            if (sb.bgx <= -1 * bgImage.width)
                sb.bgx = 0;
            //c.style.backgroundPositionX = parseInt(sb.bgx) + "px";
            //ctx.clearRect(0, 0, sb.width, sb.height);
            ctx.drawImage(bgImage, Math.round(sb.bgx), 0);
            ctx.drawImage(bgImage, Math.round(sb.bgx) + bgImage.width, 0);
            for (var i = 0; i < sb.pipes.length; i++)
                if (sb.pipes[i]) {
                    sb.pipes[i].draw();
                    if (!sb.pipes[i].isCrashed()) {
                        if (sb.pipes[i].score(bird))
                            if (bird.gainLife()) {
                                if (!sb.auto)
                                    sb.score++;
                                bird.tweet();
                            }
                    }
                }
            bird.draw();
            ctx.font = parseInt(26 * screenScaleFactor) + "px monospace";
            ctx.strokeStyle = "rgb(100,100,255)";
            ctx.lineWidth = 3 * screenScaleFactor;
            ctx.textAlign = "left";
            ctx.textBaseline = "alphabetic";
            if (sb.auto)
                ctx.strokeText("0", 30, 23 * screenScaleFactor);
            else
                ctx.strokeText(sb.score, 30, 23 * screenScaleFactor);
            for (var i = 3; i >= 1; i--) {
                ctx.beginPath();
                ctx.arc(10,
                        8 * screenScaleFactor + (3 - i) * 7 * screenScaleFactor,
                        3 * screenScaleFactor, 0, Math.PI * 2);
                if (bird.numLives() < i)
                    ctx.fillStyle = "rgb(192,64,64)";
                else
                    ctx.fillStyle = "rgb(96,192,96)";
                ctx.fill();
            }
            if (sb.loadingtags) {
                ctx.fillStyle = "rgba(64,128,64,0.4)";
                ctx.beginPath();
                ctx.arc(c.width - 25, c.height - 25, 20, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "rgba(0,0,0,0.4)";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.font = "bold 30px monospace";
                ctx.fillText("#", c.width - 25, c.height - 25);
            }
            if (sb.auto && !sb.helpVisible && !sb.warning) {
                //if (sb.helpFlash < 35) {
                ctx.fillStyle = "rgba(100,100,255,0.7)";
                ctx.beginPath();
                ctx.arc(c.width - sb.helpSize, sb.helpSize, sb.helpSize - 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = "rgba(0,0,0,0.7)";
                ctx.lineWidth = 5;
                ctx.stroke();
                ctx.fillStyle = "rgba(0,0,0,0.7)";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.font = "bold " + sb.helpSize * 3 / 2 + "px monospace";
                ctx.fillText("?", c.width - sb.helpSize, sb.helpSize);
                //}
                //sb.helpFlash--;
                //if (sb.helpFlash === 0)
                //    sb.helpFlash = 40;
            }
            ctx.textAlign = "left";
            ctx.textBaseline = "alphabetic";
            var count = 0;
            for (var i = 0; i < sb.history.length; i++) {
                if (i == 0 || sb.history[i] != sb.history[i - 1]) {
                    ctx.fillStyle = "rgba(0,0,0," + (1 - count / sb.history.length) + ")";
                    ctx.font = "bold 30px monospace";
                    ctx.fillText(sb.history[i], 5, c.height - count * 30 - 8);
                    count++;
                }
            }
        }

        function flap(event) {
            if (sb.auto) {
                if (!sb.helpVisible && !sb.warning) {
                    var x, y, left, right, bottom;
                    if (window.innerWidth > 1024) {
                        x = event.pageX - c.offsetLeft;
                        y = event.pageY - c.offsetTop;
                        left = c.width - sb.helpSize * 2;
                        right = c.width;
                        bottom = sb.helpSize * 2;
                    } else {
                        x = event.pageX;
                        y = event.pageY;
                        left = window.innerWidth - (sb.helpSize * 2 * window.innerWidth / 1024);
                        right = window.innerWidth;
                        bottom = sb.helpSize * 2 * window.innerWidth / 1024;
                    }
                    if (x >= left && x <= right && y >= 0 && y <= bottom) {
                        buttonSound.load();
                        buttonSound.play();
                        document.getElementById("help1").style.visibility = "visible";
                        sb.helpVisible = true;
                    } else {
                        flapSound.load();
                        flapSound.play();
                        sb.auto = false;
                        init();
                    }
                }
            } else
                bird.flap();
        }

        function getTags() {
            clearTimeout(sb.tagtimer);
            var xmlhttp;
            if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
                xmlhttp = new XMLHttpRequest();
            } else {// code for IE6, IE5
                xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
            }
            xmlhttp.open("GET", "http://www-acad.sheridanc.on.ca/staff/scottsam/twittybird/hashtags.php", true);
            xmlhttp.onreadystatechange = function() {
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    sb.hashtags = JSON.parse(xmlhttp.responseText);
                    sb.nexttag = parseInt(Math.random() * sb.hashtags.length);
                    sb.loadingtags = false;
                }
            };
            sb.loadingtags = true;
            xmlhttp.send();
            if (bird.isAlive() && !(sb.auto))
                sb.tagtimer = setTimeout(getTags, 30000);
        }

        c.onmousedown = flap;
        c.addEventListener("touchstart", function(event) {
            c.onmousedown = null;
            flap(event);
        });

        function helpDisplay(event) {
            buttonSound.load();
            buttonSound.play();
            var num = parseInt(event.target.id.substr(1, 1));
            document.getElementById("help" + num).style.visibility = "hidden";
            var next = document.getElementById("help" + (num + 1));
            if (next)
                next.style.visibility = "visible";
            else
                sb.helpVisible = false;
        }

        var buttons = document.getElementsByClassName("instructionButton");
        for (var i = 0; i < buttons.length; i++)
            buttons[i].onclick = helpDisplay;
        document.getElementById("warningButton").onclick = function() {
            buttonSound.load();
            buttonSound.play();
            document.getElementById("warning").style.visibility = "hidden";
            sb.warning = false;
            sb.auto = true;
            bird = new Bird();
        };
        function resize(event) {
            var tableFontSize = 40; // these must match the style sheet
            var h1FontSize = 80;

            var divs = document.querySelectorAll("div.help");
            var h1s = document.querySelectorAll("h1");
            var tables = document.querySelectorAll("table");

            for (var i = 0; i < h1s.length; i++)
                h1s[i].style.fontSize = h1FontSize + "px";
            for (var i = 0; i < tables.length; i++)
                tables[i].style.fontSize = tableFontSize + "px";

            var trs = document.querySelectorAll("tr");
            for (var i = 0; i < trs.length; i++)
                trs[i].style.height = "auto";

            var limit = (c.offsetHeight + c.offsetTop) * 0.70;
            var change;
            do {
                change = false;
                for (var i = 0; i < divs.length; i++)
                    if (divs[i].offsetHeight + divs[i].offsetTop > limit)
                        change = true;
                if (change) {
                    h1FontSize -= 2;
                    tableFontSize -= 1;
                    for (var i = 0; i < h1s.length; i++)
                        h1s[i].style.fontSize = h1FontSize + "px";
                    for (var i = 0; i < tables.length; i++)
                        tables[i].style.fontSize = tableFontSize + "px";
                }
            } while (change && tableFontSize >= 8);

            var max = 0;
            for (var i = 1; i < trs.length; i++)
                if (trs[max].offsetHeight < trs[i].offsetHeight)
                    max = i;
            var newHeight = trs[max].offsetHeight;
            for (var i = 0; i < trs.length; i++)
                trs[i].style.height = newHeight + "px";

        }
        resize();
        document.getElementById("warning").style.visibility = "visible";
        window.onresize = resize;

        init();
    }
    window.addEventListener("load", twittybird);
})();