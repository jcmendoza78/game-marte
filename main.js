// =============================================
// Marte Runner (tipo Mario) - Phaser 3
// - Plataformas + salto
// - Mapa grande (world bounds)
// - Cámara sigue al jugador
// - Sin assets externos: texturas procedurales
// =============================================

class MarsPlatformer extends Phaser.Scene {
  constructor() {
    super('mars-platformer');
  }

  create() {
    // ----- Mundo grande
    this.WORLD_W = 5200;
    this.WORLD_H = 1800;

    // Fondo base
    this.cameras.main.setBackgroundColor('#0b1d3a');

    // Texturas procedurales (no necesitas PNG para arrancar)
    this.createProceduralTextures();

    // Bounds de cámara y físicas (clave para mapa grande)
    this.cameras.main.setBounds(0, 0, this.WORLD_W, this.WORLD_H);
    this.physics.world.setBounds(0, 0, this.WORLD_W, this.WORLD_H);

    // ----- Fondo con parallax (tileSprite)
    // Se estira al tamaño del mundo; scrollFactor pequeño para efecto profundidad
    this.bg = this.add.tileSprite(0, 0, this.WORLD_W, this.WORLD_H, 'marsSky')
      .setOrigin(0, 0)
      .setScrollFactor(0.2);

    // ----- Grupo de plataformas estáticas
    this.platforms = this.physics.add.staticGroup();

    // Suelo (segmentado para eficiencia)
    const groundY = this.WORLD_H - 80;
    for (let x = 0; x < this.WORLD_W; x += 256) {
      const g = this.platforms.create(x, groundY, 'ground');
      g.setOrigin(0, 0.5);
      g.refreshBody();
    }

    // Plataformas flotantes (coordenadas estilo Mario)
    const ledges = [
      { x: 450,  y: groundY - 220 },
      { x: 820,  y: groundY - 360 },
      { x: 1200, y: groundY - 280 },
      { x: 1650, y: groundY - 420 },
      { x: 2050, y: groundY - 320 },
      { x: 2500, y: groundY - 240 },
      { x: 2950, y: groundY - 380 },
      { x: 3400, y: groundY - 260 },
      { x: 3850, y: groundY - 420 },
      { x: 4300, y: groundY - 320 },
      { x: 4700, y: groundY - 260 },
    ];

    ledges.forEach(p => {
      const ledge = this.platforms.create(p.x, p.y, 'platform');
      ledge.refreshBody();
    });

    // Obstáculos (rocas) - también estáticos
    this.rocks = this.physics.add.staticGroup();
    for (let i = 0; i < 34; i++) {
      const rx = Phaser.Math.Between(300, this.WORLD_W - 200);
      const ry = groundY - Phaser.Math.Between(0, 10);
      const rock = this.rocks.create(rx, ry, 'rock');
      rock.setScale(Phaser.Math.FloatBetween(0.8, 1.4));
      rock.refreshBody();
    }

    // ----- Jugador (física Arcade)
    this.player = this.physics.add.sprite(140, groundY - 120, 'astronaut');
    this.player.setBounce(0.05);
    this.player.setCollideWorldBounds(true);

    // Ajustes de movimiento
    this.playerSpeed = 240;
    this.jumpSpeed = 520;

    // Gravedad (tipo plataforma)
    this.player.body.setGravityY(900);

    // Colisiones
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.player, this.rocks);

    // ----- Cámara sigue al jugador
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(1.0);

    // ----- Controles teclado
    this.cursors = this.input.keyboard.createCursorKeys();

    // ----- HUD fijo (no se mueve con la cámara)
    this.hud = this.add.text(16, 16, '', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#ffffff'
    }).setScrollFactor(0);

    this.help = this.add.text(16, 38, '← → mover | ↑ saltar | Explora el mapa marciano', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#cfe3ff'
    }).setScrollFactor(0);

    // Meta simple (bandera) al final
    this.goal = this.physics.add.staticSprite(this.WORLD_W - 180, groundY - 140, 'flag');
    this.goal.setDepth(2);

    this.physics.add.overlap(this.player, this.goal, () => {
      this.win();
    }, null, this);

    this.won = false;
  }

  update() {
    if (this.won) return;

    // Movimiento lateral
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-this.playerSpeed);
      this.player.setFlipX(true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(this.playerSpeed);
      this.player.setFlipX(false);
    } else {
      this.player.setVelocityX(0);
    }

    // Salto (solo si está tocando el suelo / plataforma)
    const onGround = this.player.body.blocked.down || this.player.body.touching.down;
    if (this.cursors.up.isDown && onGround) {
      this.player.setVelocityY(-this.jumpSpeed);
    }

    // Parallax: mueve el tile del fondo según scroll de cámara
    this.bg.tilePositionX = this.cameras.main.scrollX * 0.2;
    this.bg.tilePositionY = this.cameras.main.scrollY * 0.2;

    // HUD
    this.hud.setText(
      `X: ${this.player.x.toFixed(0)}  Y: ${this.player.y.toFixed(0)}  VelX: ${this.player.body.velocity.x.toFixed(0)}`
    );

    // Caída fuera del mundo (reinicio)
    if (this.player.y > this.WORLD_H + 200) {
      this.scene.restart();
    }
  }

  win() {
    if (this.won) return;
    this.won = true;

    // Congelar movimiento
    this.player.setVelocity(0, 0);
    this.player.body.enable = false;

    const msg = this.add.text(this.scale.width / 2, this.scale.height / 2,
      '¡Llegaste a la meta! 🏁\n(Recarga para jugar de nuevo)', {
        fontFamily: 'Arial',
        fontSize: '32px',
        color: '#ffffff',
        align: 'center',
        backgroundColor: 'rgba(0,0,0,0.35)',
        padding: { x: 16, y: 12 }
      }
    ).setOrigin(0.5).setScrollFactor(0);

    // Efecto cámara
    this.cameras.main.flash(250, 255, 106, 0);
  }

  createProceduralTextures() {
    // Usamos Graphics para generar texturas simples (placeholder)
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // --- Fondo "cielo" marciano (tile)
    g.fillStyle(0x071428, 1);
    g.fillRect(0, 0, 128, 128);

    // estrellas / polvo
    for (let i = 0; i < 120; i++) {
      const x = Phaser.Math.Between(0, 127);
      const y = Phaser.Math.Between(0, 127);
      const c = Phaser.Math.Between(0x1a2d52, 0x2a3f6f);
      g.fillStyle(c, 1);
      g.fillRect(x, y, 2, 2);
    }

    // neblina rojiza
    g.fillStyle(0x3a140e, 0.35);
    g.fillCircle(32, 90, 34);
    g.fillCircle(92, 70, 42);

    g.generateTexture('marsSky', 128, 128);
    g.clear();

    // --- Suelo (256x64)
    g.fillStyle(0x7a3a1c, 1);
    g.fillRect(0, 0, 256, 64);

    // textura arenosa
    for (let i = 0; i < 220; i++) {
      const x = Phaser.Math.Between(0, 255);
      const y = Phaser.Math.Between(0, 63);
      const c = Phaser.Math.Between(0x6b3117, 0x8b4a26);
      g.fillStyle(c, 1);
      g.fillRect(x, y, 2, 2);
    }

    // borde superior más oscuro
    g.fillStyle(0x4e2412, 1);
    g.fillRect(0, 0, 256, 8);

    g.generateTexture('ground', 256, 64);
    g.clear();

    // --- Plataforma (160x28)
    g.fillStyle(0x5b2a15, 1);
    g.fillRoundedRect(0, 0, 160, 28, 10);
    g.fillStyle(0x3f1d10, 1);
    g.fillRoundedRect(0, 0, 160, 6, 6);
    g.generateTexture('platform', 160, 28);
    g.clear();

    // --- Roca (44x34)
    g.fillStyle(0x2c1c16, 1);
    g.fillRoundedRect(2, 6, 40, 24, 10);
    g.fillStyle(0x3b2a22, 1);
    g.fillRoundedRect(12, 12, 16, 10, 6);
    g.generateTexture('rock', 44, 34);
    g.clear();

    // --- Astronauta (32x40)
    g.fillStyle(0xeaeaea, 1);
    g.fillRoundedRect(6, 6, 20, 26, 8);   // cuerpo

    g.fillStyle(0x2d7dd2, 1);
    g.fillRoundedRect(10, 10, 12, 10, 4); // visor

    g.fillStyle(0xff6a00, 1);
    g.fillRect(14, 24, 4, 6);            // detalle

    // botas
    g.fillStyle(0xbdbdbd, 1);
    g.fillRect(8, 32, 7, 6);
    g.fillRect(17, 32, 7, 6);

    g.generateTexture('astronaut', 32, 40);
    g.clear();

    // --- Bandera meta (24x80)
    g.fillStyle(0xffffff, 1);
    g.fillRect(10, 0, 4, 80);             // poste
    g.fillStyle(0xff6a00, 1);
    g.fillTriangle(14, 10, 24, 16, 14, 24); // banderín
    g.generateTexture('flag', 24, 80);

    g.destroy();
  }
}

// Configuración Phaser: Arcade Physics
const config = {
  type: Phaser.AUTO,
  width: 900,
  height: 600,
  parent: 'game',
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [MarsPlatformer]
};

new Phaser.Game(config);
