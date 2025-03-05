// Escena de introducción (estilo Undertale)
class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: 'IntroScene' });
  }

  preload() {
    this.load.image('introBG', 'assets/intro.jpg');
  }

  create() {
    // Fondo de la introducción
    this.add.image(400, 300, 'introBG');
    const introText = "En un mundo steampunk donde tecnología, magia y artes se entrelazan,\n" +
                      "la historia de antiguos reinos y razas olvidadas renace...\n\n" +
                      "Presiona cualquier tecla para continuar.";
    this.add.text(400, 100, introText, { fontSize: '24px', fill: '#fff', align: 'center' }).setOrigin(0.5);

    // Al presionar cualquier tecla, pasar a la escena para ingresar el nombre
    this.input.keyboard.once('keydown', () => {
      this.scene.start('NameInputScene');
    });
  }
}

// Nueva escena para ingresar el nombre del jugador
class NameInputScene extends Phaser.Scene {
  constructor() {
    super({ key: 'NameInputScene' });
  }

  preload() {
    // Reutilizamos la imagen de fondo de la introducción
    this.load.image('introBG', 'assets/intro.jpg');
  }

  create() {
    // Fondo
    this.add.image(400, 300, 'introBG').setOrigin(0.5);
    this.add.text(400, 150, 'Ingresa tu nombre:', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);

    // Creamos un elemento DOM para el input (requiere habilitar dom: { createContainer: true } en el config)
    let inputElement = this.add.dom(400, 300, 'input', {
      type: 'text',
      name: 'playerName',
      placeholder: 'Tu nombre aquí',
      fontSize: '24px',
      padding: '10px'
    });

    // Botón para continuar
    let submitButton = this.add.dom(400, 400, 'button', {
      fontSize: '24px',
      padding: '10px'
    }, 'Continuar');

    submitButton.addListener('click');
    submitButton.on('click', () => {
      let playerName = inputElement.getChildByName('playerName').value;
      if (playerName === "") {
        playerName = "Jugador";
      }
      // Pasamos el nombre a la siguiente escena
      this.scene.start('CharacterSelectScene', { playerName: playerName });
    });
  }
}

// Escena de selección de personaje
class CharacterSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CharacterSelectScene' });
  }

  preload() {
    this.load.image('humanIcon', 'assets/human.png');
    this.load.image('chimeraIcon', 'assets/chimera.png');
    this.load.image('mechanitaIcon', 'assets/mechanita.png');
  }

  create(data) {
    // Obtenemos el nombre del jugador pasado desde la escena anterior
    let playerName = data.playerName || "Jugador";
    this.add.text(400, 50, `Bienvenido, ${playerName}`, { fontSize: '28px', fill: '#fff' }).setOrigin(0.5);
    this.add.text(400, 100, 'Elige tu personaje', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);

    // Botón para Humanos
    let humanButton = this.add.image(200, 300, 'humanIcon').setInteractive();
    humanButton.on('pointerdown', () => {
      this.scene.start('MainGameScene', { race: 'human', playerName: playerName });
    });

    // Botón para Quimeras
    let chimeraButton = this.add.image(400, 300, 'chimeraIcon').setInteractive();
    chimeraButton.on('pointerdown', () => {
      this.scene.start('MainGameScene', { race: 'chimera', playerName: playerName });
    });

    // Botón para Mecanitas
    let mechanitaButton = this.add.image(600, 300, 'mechanitaIcon').setInteractive();
    mechanitaButton.on('pointerdown', () => {
      this.scene.start('MainGameScene', { race: 'mechanita', playerName: playerName });
    });
  }
}

// Escena principal del juego (Roguelike)
class MainGameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainGameScene' });
    this.roomsCompleted = 0;
    this.coins = 0;
  }

  init(data) {
    this.playerRace = data.race || 'human';
    this.playerName = data.playerName || "Jugador";
  }

  preload() {
    // Cargar assets generales
    this.load.image('room', 'assets/room.png');
    this.load.image('coin', 'assets/coin.png');
    this.load.image('door', 'assets/door.png');
    this.load.image('boss', 'assets/boss.png');
    this.load.image('shop', 'assets/shop.png');
    this.load.spritesheet('player', 'assets/player.png', { frameWidth: 32, frameHeight: 48 });
  }

  create() {
    // Fondo de la sala
    this.add.image(400, 300, 'room');
    // Crear al jugador
    this.player = this.physics.add.sprite(100, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // Grupo de monedas y generación de 7 monedas para la sala
    this.coinsGroup = this.physics.add.group();
    this.spawnCoins();
    this.physics.add.overlap(this.player, this.coinsGroup, this.collectCoin, null, this);

    // Crear la puerta en una posición fija y marcarla como bloqueada
    this.door = this.physics.add.sprite(750, 300, 'door');
    this.door.locked = true;
    this.door.setTint(0xff0000);
    this.physics.add.overlap(this.player, this.door, this.enterDoor, null, this);

    // Configurar cursores para el movimiento del jugador
    this.cursors = this.input.keyboard.createCursorKeys();
    // Texto de progreso
    this.scoreText = this.add.text(16, 16, `Salas: ${this.roomsCompleted}  Monedas: ${this.coins}`, { fontSize: '20px', fill: '#fff' });
  }

  update() {
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    } else {
      this.player.setVelocityX(0);
    }
    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-160);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(160);
    } else {
      this.player.setVelocityY(0);
    }
  }

  spawnCoins() {
    this.coinsGroup.clear(true, true);
    for (let i = 0; i < 7; i++) {
      let x = Phaser.Math.Between(100, 700);
      let y = Phaser.Math.Between(100, 500);
      this.coinsGroup.create(x, y, 'coin');
    }
  }

  collectCoin(player, coin) {
    coin.disableBody(true, true);
    this.coins++;
    this.scoreText.setText(`Salas: ${this.roomsCompleted}  Monedas: ${this.coins}`);
    if (this.coins >= 7 && this.door.locked) {
      this.door.locked = false;
      this.door.clearTint();
      console.log("¡Puerta desbloqueada!");
    }
  }

  enterDoor(player, door) {
    if (!door.locked) {
      this.completeRoom();
    }
  }

  completeRoom() {
    this.roomsCompleted++;
    this.coins = 0;
    this.scoreText.setText(`Salas: ${this.roomsCompleted}  Monedas: ${this.coins}`);
    if (this.roomsCompleted % 10 === 0) {
      this.spawnBoss();
    } else if (this.roomsCompleted % 7 === 0) {
      this.spawnShop();
    } else {
      this.resetRoom();
    }
  }

  resetRoom() {
    this.spawnCoins();
    this.door.locked = true;
    this.door.setTint(0xff0000);
  }

  spawnBoss() {
    console.log("¡Boss!");
    let bossSprite = this.add.image(400, 300, 'boss');
    this.physics.add.existing(bossSprite);
    this.time.delayedCall(5000, () => {
      bossSprite.destroy();
      this.resetRoom();
    }, null, this);
  }

  spawnShop() {
    console.log("¡Tienda!");
    let shopSprite = this.add.image(400, 300, 'shop');
    this.physics.pause();
    this.time.delayedCall(5000, () => {
      shopSprite.destroy();
      this.physics.resume();
      this.resetRoom();
    }, null, this);
  }
}

// Configuración de Phaser
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  dom: {
    createContainer: true
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [IntroScene, NameInputScene, CharacterSelectScene, MainGameScene]
};

const game = new Phaser.Game(config);

// Funciones para la comunicación con el servidor (no se han modificado)
function submitScore(playerName, rooms, coins) {
  fetch('/api/submitScore', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: playerName, rooms: rooms, coins: coins })
  })
  .then(res => res.json())
  .then(data => {
    console.log("Puntaje enviado:", data);
    getLeaderboard();
  })
  .catch(err => console.error(err));
}

function getLeaderboard() {
  fetch('/api/leaderboard')
    .then(res => res.json())
    .then(data => {
      const lbDiv = document.getElementById('leaderboard');
      lbDiv.innerHTML = '<h2>Ranking</h2>';
      data.forEach((entry, index) => {
        lbDiv.innerHTML += `<p>${index + 1}. ${entry.name} - Salas: ${entry.rooms}, Monedas: ${entry.coins}</p>`;
      });
    })
    .catch(err => console.error(err));
}

window.submitScore = submitScore;
window.getLeaderboard = getLeaderboard;