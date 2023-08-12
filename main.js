// * Initiate Phaser Game
const config = {
  type: Phaser.AUTO,
  width: 360,
  height: 641,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: true // false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

// ! Initialization Game Engine
const game = new Phaser.Game(config);

// * Declare Variable
let player;
let backgroundSpeed = 1;
let backgroundGroup;
let obstaclesGroup;
let distanceText;
let distance = 0;
let cursors;

// * Load game assets
function preload() {
  this.load.image('background', './assets/background.png');
  this.load.image('player', './assets/player.png');
  this.load.image('leftButton', './assets/left-button.png');
  this.load.image('rightButton', './assets/right-button.png');
  this.load.image('rock', './assets/rock.png')
}

// * Make an object
function create() {
  //! Enable physics system
  this.physics.world.setBounds(0, 0, config.width, config.height);

  backgroundGroup = this.add.group();
  // * Set and adjust a background
  const maxWorld = 3; // ! Set max world generated
  for (let i = 0; i < maxWorld; i++) {
    const backgroundImage = this.add.image(360, -config.height * i, 'background');
    backgroundImage.setOrigin(1, 0);
    backgroundImage.displayWidth = config.width;
    backgroundImage.displayHeight = backgroundImage.height * (config.width / backgroundImage.width);
    backgroundGroup.add(backgroundImage);
  }

  // * Make player
  player = this.physics.add.sprite(37.5, 0, 'player');//(config.width / 2, 0, 'player');
  player.setOrigin(0, 0); // (0.5, 0)
  player.setY(config.height - 200);
  /* this.tweens.add({
    targets: player,
    x: targetX,
    flipX: true,
    yoyo: true,
    duration: 3000,
    repeat: 1
  }); */

  // * Set left and right button
  leftButton = this.add.sprite(config.width / 4, config.height - 50, 'leftButton').setInteractive().setScale(0.1);
  rightButton = this.add.sprite(config.width * 3 / 4, config.height - 50, 'rightButton').setInteractive().setScale(0.1);

  leftButton.on('pointerdown', () => movePlayer(-1));
  rightButton.on('pointerdown', () => movePlayer(1));


  // * Displaying Player's Score
  distanceText = this.add.text(
    16, 16, "Jarak: ",
    { fontsize: '32px', fill: '#fff', }
  );

  // * Obstacles
  //obstaclesGroup = this.add.group();
  obstaclesGroup = this.physics.add.group();

  // * Start spawning obstacles
  const self = this;
  this.time.addEvent({
    delay: 4000,
    loop: true,
    callback: function () { spawnObstacle.call(self) },
    callbackScope: this
  });
}

// * Update game while playing
function update() {
  // ! Set background motion speed
  backgroundSpeed = calculateBackgroundSpeed(distance);

  backgroundGroup.getChildren().forEach(child => {
    child.y += backgroundSpeed;
    // ! Reset position of background when it goes off
    if (child.y > config.height) {
      child.y -= config.height * 3;
    }
  });

  // * Displays player scores
  distance += backgroundSpeed / 7.5;//15;
  distanceText.setText(`Score: ${Math.floor(distance)}`);

  // * Check collision 
  //this.overlap(player, obstaclesGroup, handleCollision, null, this);
  this.physics.overlap(player, obstaclesGroup, handleCollision, null, this);
}

// * Additional Function

function movePlayer(direction) {
  const laneWidth = (config.width - 60) / 4; // Lebar jalur dengan margin 20 piksel dari kedua sisi
  const laneCenterX = [laneWidth / 2, laneWidth * 1.5, laneWidth * 2.5, laneWidth * 3.5]; // Titik tengah dari setiap jalur
  const currentLane = Math.floor(player.x / laneWidth); // Jalur saat ini
  let targetLane = currentLane + direction; // Jalur yang dituju

  // Menyesuaikan targetLane agar tidak keluar dari batas jalur
  targetLane = Phaser.Math.Clamp(targetLane, 0, 3);

  const targetX = laneCenterX[targetLane];

  player.x = targetX;

  // Menambahkan animasi perpindahan player
}

function updateSpawnSettings(score) {
  // Mengatur jumlah obstacles dan lanes berdasarkan progres score
  for (const level of levelProgression) {
    if (score >= level.distance) {
      maxObstacles = Math.min(level.maxObstacles, maxLanes);
      maxLanes = level.maxLanes;
      minSpawnDelay = level.minSpawnDelay;
      maxSpawnDelay = level.maxSpawnDelay;
    } else {
      break;
    }
  }
}

function spawnObstacle() {
  const laneWidth = (config.width - 60) / 4;

  let randomLane;
  if (Math.random() < 0.80) {
    randomLane = Phaser.Math.Between(0, 3); // Pilih jalur secara acak
  } else {
    randomLane = Math.floor(player.x / laneWidth);
  }

  const laneCenterX = [laneWidth / 2, laneWidth * 1.5, laneWidth * 2.5, laneWidth * 3.5];

  const obstacleOffset = 30;
  const obstacleX = laneCenterX[randomLane] + obstacleOffset; // Gunakan posisi X sesuai jalur yang dipilih
  const obstacleY = -50;

  const obstacle = obstaclesGroup.create(obstacleX, obstacleY, 'rock')
  obstacle.setScale(0.2);
  obstacle.setVelocityY(backgroundSpeed * 60);
}
// TODO: make a affect of Collision
function handleCollision(player, obstacle) {
  // ...
  endGame.call(this);

  //player.setVelocityY(0);
  obstaclesGroup.setVelocityY(0);
}

// TODO: Make an end game function
function endGame() {
  backgroundSpeed = 0;

  // Display game over layout
  this.add.text(
    config.width / 2,
    config.height / 2,
    `Game Over\nScore: ${Math.floor(distance)}`,
    {
      fontSize: '48px',
      fill: '#fff',
      align: 'center'
    }
  ).setOrigin(0.5);

  // Destroy player and obstacles
  player.destroy();
  obstaclesGroup.destroy(true);

  // TODO: Add animation for player's death
}

const levelProgression = [
  { distance: 100, speedUp: 0.05 },
  { distance: 500, speedUp: 0.1 },
  { distance: 1000, speedUp: 0.15 },
  { distance: 2000, speedUp: 0.2 },
  { distance: 6000, speedUp: 0.2 },
  { distance: 10000, speedUp: 0.25 }
];

function calculateBackgroundSpeed(distance) {
  const baseSpeed = 1;
  let speedIncrease = 0.1;

  // * Speed Increase percentage based on progress
  for (const level of levelProgression) {
    if (distance >= level.distance) {
      speedIncrease = level.speedUp;
    } else {
      break;
    }
  }

  const levelMultiplier = Math.floor(distance / 200);

  return baseSpeed + baseSpeed * speedIncrease * levelMultiplier;
}
