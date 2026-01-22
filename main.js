// ==========================================================
// Marte Runner EDU (Tipo Mario + Estaciones obligatorias)
// Phaser 3 - Arcade Physics
// Público objetivo: Jóvenes (13–17)
// Modo elegido: Estaciones OBLIGATORIAS (en cualquier orden)
// - Mundo grande + cámara follow
// - Plataformas + salto
// - Estaciones (POI) activan actividades educativas
// - Actividades: Quiz, Verdadero/Falso, Secuencia
// - Meta final bloqueada hasta completar todas (con "puerta" física)
// - Sin assets externos (texturas procedurales)
// ==========================================================

class MarsEduPlatformer extends Phaser.Scene {
  constructor() {
    super('mars-edu');
  }

  create() {
    // -----------------
    // 1) Mundo grande
    // -----------------
    this.WORLD_W = 5600;
    this.WORLD_H = 1800;
    this.groundY = this.WORLD_H - 80;

    this.cameras.main.setBackgroundColor('#0b1d3a');
    this.createProceduralTextures();

    // Bounds de cámara y físicas
    this.cameras.main.setBounds(0, 0, this.WORLD_W, this.WORLD_H);
    this.physics.world.setBounds(0, 0, this.WORLD_W, this.WORLD_H);

    // Fondo con parallax
    this.bg = this.add.tileSprite(0, 0, this.WORLD_W, this.WORLD_H, 'marsSky')
      .setOrigin(0, 0)
      .setScrollFactor(0.2);

    // -----------------
    // 2) Plataformas y obstáculos
    // -----------------
    this.platforms = this.physics.add.staticGroup();

    // Suelo segmentado
    for (let x = 0; x < this.WORLD_W; x += 256) {
      const g = this.platforms.create(x, this.groundY, 'ground');
      g.setOrigin(0, 0.5);
      g.refreshBody();
    }

    // Plataformas flotantes
    const ledges = [
      { x: 420,  y: this.groundY - 220 },
      { x: 820,  y: this.groundY - 360 },
      { x: 1230, y: this.groundY - 280 },
      { x: 1700, y: this.groundY - 430 },
      { x: 2100, y: this.groundY - 320 },
      { x: 2550, y: this.groundY - 250 },
      { x: 3020, y: this.groundY - 390 },
      { x: 3500, y: this.groundY - 260 },
      { x: 3980, y: this.groundY - 440 },
      { x: 4500, y: this.groundY - 330 },
      { x: 4980, y: this.groundY - 260 }
    ];

    ledges.forEach(p => {
      const ledge = this.platforms.create(p.x, p.y, 'platform');
      ledge.refreshBody();
    });

    // Rocas
    this.rocks = this.physics.add.staticGroup();
    for (let i = 0; i < 36; i++) {
      const rx = Phaser.Math.Between(300, this.WORLD_W - 200);
      const ry = this.groundY - Phaser.Math.Between(0, 10);
      const rock = this.rocks.create(rx, ry, 'rock');
      rock.setScale(Phaser.Math.FloatBetween(0.8, 1.4));
      rock.refreshBody();
    }

    // -----------------
    // 3) Jugador
    // -----------------
    this.player = this.physics.add.sprite(140, this.groundY - 120, 'astronaut');
    this.player.setBounce(0.05);
    this.player.setCollideWorldBounds(true);
    this.player.body.setGravityY(900);

    this.playerSpeed = 240;
    this.jumpSpeed = 520;

    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.player, this.rocks);

    // Cámara follow
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(1.0);

    // Teclado
    this.cursors = this.input.keyboard.createCursorKeys();

    // -----------------
    // 4) Estaciones educativas (OBLIGATORIAS, cualquier orden)
    // -----------------
    this.stationData = [
      {
        id: 'atm',
        x: 900,
        y: this.groundY - 140,
        title: 'Estación 1 · Atmósfera',
        text: 'La atmósfera de Marte es MUY delgada y está compuesta principalmente por CO₂. Eso influye en la temperatura y en las tormentas de polvo.',
        activity: {
          type: 'quiz',
          question: '¿Qué gas predomina en la atmósfera de Marte?',
          options: ['Oxígeno', 'CO₂', 'Nitrógeno', 'Helio'],
          correct: 1,
          fact: 'Correcto: Marte tiene una atmósfera mayormente de dióxido de carbono (CO₂).'
        }
      },
      {
        id: 'sol',
        x: 1750,
        y: this.groundY - 380,
        title: 'Estación 2 · Un día en Marte',
        text: 'Un día marciano se llama “sol”. Es un poco más largo que el día en la Tierra, lo cual afecta la planificación de misiones.',
        activity: {
          type: 'truefalse',
          statement: 'Un “sol” en Marte dura aproximadamente 24h 39m.',
          correct: true,
          fact: 'Sí: un sol dura ~24 horas y 39 minutos.'
        }
      },
      {
        id: 'geo',
        x: 3100,
        y: this.groundY - 240,
        title: 'Estación 3 · Geografía extrema',
        text: 'Marte tiene relieves enormes. Olympus Mons es el volcán más grande del Sistema Solar y Valles Marineris es un cañón gigantesco.',
        activity: {
          type: 'sequence',
          prompt: 'Ordena el proceso (lógico) para estudiar un lugar en Marte:',
          items: ['Tomar imágenes', 'Analizar el terreno', 'Elegir zona de muestreo', 'Recolectar muestra'],
          correctOrder: ['Tomar imágenes', 'Analizar el terreno', 'Elegir zona de muestreo', 'Recolectar muestra'],
          fact: 'Buena lógica: primero observas, luego analizas, decides y finalmente muestras.'
        }
      },
      {
        id: 'rover',
        x: 4550,
        y: this.groundY - 330,
        title: 'Estación 4 · Rovers',
        text: 'Los rovers son laboratorios móviles. Exploran, perforan, analizan rocas y envían datos a la Tierra.',
        activity: {
          type: 'quiz',
          question: '¿Qué rover llegó a Marte en 2021?',
          options: ['Curiosity', 'Perseverance', 'Spirit', 'Sojourner'],
          correct: 1,
          fact: 'Perseverance aterrizó en 2021 y trabajó junto al helicóptero Ingenuity (misión original).'
        }
      }
    ];

    this.completedStations = new Set();
    this.score = 0;
    this.uiActive = false;
    this.stationCooldownUntil = 0;

    // Sprites de estaciones (para marcarlas en verde al completar)
    this.stationSprites = new Map();

    this.stations = this.physics.add.staticGroup();

    this.stationData.forEach(s => {
      const st = this.stations.create(s.x, s.y, 'station');
      st.setData('stationId', s.id);
      st.refreshBody();
      this.stationSprites.set(s.id, st);

      // Etiqueta de estación (mundo)
      this.add.text(s.x, s.y - 70, s.title.replace('Estación ', 'E'), {
        fontFamily: 'Arial',
        fontSize: '12px',
        color: '#ffffff',
        backgroundColor: 'rgba(0,0,0,0.25)',
        padding: { x: 6, y: 3 }
      }).setOrigin(0.5);
    });

    // Trigger por overlap para activar la actividad
    this.physics.add.overlap(this.player, this.stations, this.onReachStation, null, this);

    // -----------------
    // 5) Meta final + Puerta (bloqueo físico)
    // -----------------
    this.goal = this.physics.add.staticSprite(this.WORLD_W - 160, this.groundY - 140, 'flag');
    this.goal.setDepth(2);

    // Puerta: bloquea el paso hasta completar todas las estaciones
    this.gate = this.physics.add.staticImage(this.WORLD_W - 320, this.groundY - 120, 'gate');
    this.gate.refreshBody();

    // Colisión contra la puerta
    this.physics.add.collider(this.player, this.gate, () => {
      if (this.completedStations.size < this.stationData.length) {
        this.openInfoOnlyUI(
          'Meta bloqueada',
          `Completa todas las estaciones para terminar la misión.\nProgreso: ${this.completedStations.size}/${this.stationData.length}`
        );
      }
    }, null, this);

    // Llegar a la bandera: solo gana si la puerta ya se abrió
    this.physics.add.overlap(this.player, this.goal, () => {
      if (this.completedStations.size >= this.stationData.length) {
        this.win();
      } else {
        this.openInfoOnlyUI(
          'Aún no',
          `Te faltan estaciones: ${this.stationData.length - this.completedStations.size}.\nProgreso: ${this.completedStations.size}/${this.stationData.length}`
        );
      }
    }, null, this);

    // -----------------
    // 6) HUD fijo
    // -----------------
    this.hud = this.add.text(16, 16, '', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#ffffff'
    }).setScrollFactor(0);

    this.help = this.add.text(16, 38, '← → mover | ↑ saltar | Estaciones obligatorias (cualquier orden)', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#cfe3ff'
    }).setScrollFactor(0);

    this.mission = this.add.text(16, 60, '', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#cfe3ff'
    }).setScrollFactor(0);

    this.toast = null;
    this.won = false;
  }

  update() {
    if (this.won) return;

    // Fondo parallax
    this.bg.tilePositionX = this.cameras.main.scrollX * 0.2;
    this.bg.tilePositionY = this.cameras.main.scrollY * 0.2;

    // UI activa: bloquea controles
    if (this.uiActive) {
      this.player.setVelocityX(0);
      return;
    }

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

    // Salto
    const onGround = this.player.body.blocked.down || this.player.body.touching.down;
    if (this.cursors.up.isDown && onGround) {
      this.player.setVelocityY(-this.jumpSpeed);
    }

    // HUD
    this.hud.setText(`Puntos: ${this.score}   Estaciones: ${this.completedStations.size}/${this.stationData.length}`);
    this.mission.setText(this.completedStations.size < this.stationData.length
      ? 'Objetivo: completa todas las estaciones para desbloquear la meta 🛰️'
      : '¡Meta desbloqueada! ve a la bandera 🏁');

    // Caída
    if (this.player.y > this.WORLD_H + 200) {
      this.scene.restart();
    }
  }

  // =====================================================
  // Estaciones / Actividades
  // =====================================================

  onReachStation(player, station) {
    const now = this.time.now;
    if (this.uiActive) return;
    if (now < this.stationCooldownUntil) return;

    const id = station.getData('stationId');
    if (this.completedStations.has(id)) return;

    const data = this.stationData.find(s => s.id === id);
    if (!data) return;

    this.openStationUI(data);
  }

  openStationUI(station) {
    this.uiActive = true;
    this.player.setVelocity(0, 0);

    const w = this.scale.width;
    const h = this.scale.height;

    const dim = this.add.rectangle(w/2, h/2, w, h, 0x000000, 0.45).setScrollFactor(0);
    const card = this.add.rectangle(w/2, h/2, Math.min(820, w-40), 380, 0x0f2a52, 0.97)
      .setScrollFactor(0);
    card.setStrokeStyle(2, 0x2e6bc2, 1);

    const title = this.add.text(w/2, h/2 - 160, station.title, {
      fontFamily: 'Arial',
      fontSize: '22px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0);

    const info = this.add.text(w/2, h/2 - 120, station.text, {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#cfe3ff',
      wordWrap: { width: Math.min(760, w-80) },
      align: 'center'
    }).setOrigin(0.5).setScrollFactor(0);

    this.ui = this.add.container(0, 0, [dim, card, title, info]).setDepth(999);

    const a = station.activity;
    if (!a || !a.type) {
      this.renderContinueButton('CONTINUAR', () => {
        this.completeStation(station.id, 5);
        this.closeStationUI();
      });
      return;
    }

    if (a.type === 'quiz') {
      this.renderQuiz(station);
    } else if (a.type === 'truefalse') {
      this.renderTrueFalse(station);
    } else if (a.type === 'sequence') {
      this.renderSequence(station);
    } else {
      this.renderContinueButton('CONTINUAR', () => {
        this.completeStation(station.id, 5);
        this.closeStationUI();
      });
    }
  }

  renderQuiz(station) {
    const w = this.scale.width;
    const h = this.scale.height;
    const a = station.activity;

    const qText = this.add.text(w/2, h/2 - 45, a.question, {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff',
      wordWrap: { width: Math.min(760, w-80) },
      align: 'center'
    }).setOrigin(0.5).setScrollFactor(0);

    const feedback = this.add.text(w/2, h/2 + 120, '', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#cfe3ff',
      wordWrap: { width: Math.min(760, w-80) },
      align: 'center'
    }).setOrigin(0.5).setScrollFactor(0);

    this.ui.add(qText);
    this.ui.add(feedback);

    const btns = [];
    const startY = h/2 + 10;

    a.options.forEach((opt, i) => {
      const y = startY + i * 44;

      const btnBg = this.add.rectangle(w/2, y, Math.min(700, w-120), 38, 0x173a70, 1)
        .setInteractive({ useHandCursor: true })
        .setScrollFactor(0);
      btnBg.setStrokeStyle(2, 0x2e6bc2, 1);

      const btnText = this.add.text(w/2, y, opt, {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#ffffff'
      }).setOrigin(0.5).setScrollFactor(0);

      btnBg.on('pointerover', () => btnBg.setFillStyle(0x1f4b8f, 1));
      btnBg.on('pointerout', () => btnBg.setFillStyle(0x173a70, 1));

      btnBg.on('pointerdown', () => {
        btns.forEach(b => b.disableInteractive());
        const ok = (i === a.correct);

        if (ok) {
          btnBg.setFillStyle(0x1f8f3a, 1);
          feedback.setText(`✅ Correcto. ${a.fact}`);
          this.completeStation(station.id, 10);
        } else {
          btnBg.setFillStyle(0x9b1c1c, 1);
          feedback.setText(`❌ Incorrecto. ${a.fact}`);
          this.completeStation(station.id, 5);
        }

        this.time.delayedCall(900, () => {
          this.renderContinueButton('CONTINUAR', () => this.closeStationUI());
        });
      });

      btns.push(btnBg);
      this.ui.add(btnBg);
      this.ui.add(btnText);
    });
  }

  renderTrueFalse(station) {
    const w = this.scale.width;
    const h = this.scale.height;
    const a = station.activity;

    const statement = this.add.text(w/2, h/2 - 45, a.statement, {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff',
      wordWrap: { width: Math.min(760, w-80) },
      align: 'center'
    }).setOrigin(0.5).setScrollFactor(0);

    const feedback = this.add.text(w/2, h/2 + 90, '', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#cfe3ff',
      wordWrap: { width: Math.min(760, w-80) },
      align: 'center'
    }).setOrigin(0.5).setScrollFactor(0);

    this.ui.add(statement);
    this.ui.add(feedback);

    const makeBtn = (label, x, y, color, value) => {
      const bg = this.add.rectangle(x, y, 180, 44, color, 1)
        .setInteractive({ useHandCursor: true })
        .setScrollFactor(0);

      const t = this.add.text(x, y, label, {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#1b0c00',
        fontStyle: 'bold'
      }).setOrigin(0.5).setScrollFactor(0);

      bg.on('pointerdown', () => {
        bg.disableInteractive();
        btnTrue.disableInteractive();
        btnFalse.disableInteractive();

        const ok = (value === a.correct);
        if (ok) {
          feedback.setText(`✅ Correcto. ${a.fact}`);
          this.completeStation(station.id, 10);
        } else {
          feedback.setText(`❌ Incorrecto. ${a.fact}`);
          this.completeStation(station.id, 5);
        }

        this.time.delayedCall(900, () => {
          this.renderContinueButton('CONTINUAR', () => this.closeStationUI());
        });
      });

      this.ui.add(bg);
      this.ui.add(t);
      return bg;
    };

    const btnTrue = makeBtn('VERDADERO', w/2 - 120, h/2 + 10, 0xff6a00, true);
    const btnFalse = makeBtn('FALSO', w/2 + 120, h/2 + 10, 0xff6a00, false);
  }

  renderSequence(station) {
    const w = this.scale.width;
    const h = this.scale.height;
    const a = station.activity;

    const prompt = this.add.text(w/2, h/2 - 70, a.prompt, {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff',
      wordWrap: { width: Math.min(760, w-80) },
      align: 'center'
    }).setOrigin(0.5).setScrollFactor(0);

    const feedback = this.add.text(w/2, h/2 + 130, '', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#cfe3ff',
      wordWrap: { width: Math.min(760, w-80) },
      align: 'center'
    }).setOrigin(0.5).setScrollFactor(0);

    const chosenText = this.add.text(w/2, h/2 + 90, 'Tu orden: (elige 4)', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#cfe3ff'
    }).setOrigin(0.5).setScrollFactor(0);

    this.ui.add(prompt);
    this.ui.add(feedback);
    this.ui.add(chosenText);

    // Mezcla items
    const items = [...a.items];
    Phaser.Utils.Array.Shuffle(items);

    const chosen = [];
    const btns = [];

    const startY = h/2 - 15;
    items.forEach((label, idx) => {
      const y = startY + idx * 38;

      const bg = this.add.rectangle(w/2, y, Math.min(720, w-120), 32, 0x173a70, 1)
        .setInteractive({ useHandCursor: true })
        .setScrollFactor(0);
      bg.setStrokeStyle(2, 0x2e6bc2, 1);

      const t = this.add.text(w/2, y, label, {
        fontFamily: 'Arial',
        fontSize: '15px',
        color: '#ffffff'
      }).setOrigin(0.5).setScrollFactor(0);

      bg.on('pointerover', () => bg.setFillStyle(0x1f4b8f, 1));
      bg.on('pointerout', () => bg.setFillStyle(0x173a70, 1));

      bg.on('pointerdown', () => {
        if (chosen.length >= a.correctOrder.length) return;
        bg.disableInteractive();
        bg.setAlpha(0.5);
        t.setAlpha(0.5);

        chosen.push(label);
        chosenText.setText('Tu orden: ' + chosen.join(' → '));

        if (chosen.length === a.correctOrder.length) {
          btns.forEach(b => b.disableInteractive());

          const ok = chosen.every((v, i) => v === a.correctOrder[i]);
          if (ok) {
            feedback.setText(`✅ Orden correcto. ${a.fact}`);
            this.completeStation(station.id, 12);
          } else {
            feedback.setText(`❌ Orden no ideal. ${a.fact}`);
            this.completeStation(station.id, 6);
          }

          this.time.delayedCall(900, () => {
            this.renderContinueButton('CONTINUAR', () => this.closeStationUI());
          });
        }
      });

      btns.push(bg);
      this.ui.add(bg);
      this.ui.add(t);
    });
  }

  completeStation(stationId, points) {
    const wasCompleted = this.completedStations.has(stationId);

    if (!wasCompleted) {
      this.completedStations.add(stationId);

      // Marca estación como completada (verde)
      const sprite = this.stationSprites.get(stationId);
      if (sprite) {
        sprite.setTint(0x55ff99);
      }

      // Toast rápido
      this.showToast(`✅ ${stationId.toUpperCase()} completada (+${points} pts)`);
    }

    this.score += points;

    // ¿Ya completó todas? Abrir puerta
    if (this.completedStations.size === this.stationData.length) {
      this.unlockGoal();
    }
  }

  unlockGoal() {
    if (this.gate) {
      this.gate.destroy();
      this.gate = null;
      this.showToast('🔓 ¡Meta desbloqueada! Ve a la bandera 🏁');
    }
  }

  showToast(message) {
    if (this.toast) {
      this.toast.destroy();
      this.toast = null;
    }

    this.toast = this.add.text(this.scale.width / 2, 92, message, {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.35)',
      padding: { x: 10, y: 6 }
    }).setOrigin(0.5).setScrollFactor(0);

    this.time.delayedCall(1200, () => {
      if (this.toast) {
        this.toast.destroy();
        this.toast = null;
      }
    });
  }

  renderContinueButton(label, onClick) {
    const w = this.scale.width;
    const h = this.scale.height;

    if (this._continueBtn) return;

    const btn = this.add.rectangle(w/2, h/2 + 165, 220, 46, 0xff6a00, 1)
      .setInteractive({ useHandCursor: true })
      .setScrollFactor(0);

    const txt = this.add.text(w/2, h/2 + 165, label, {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#1b0c00',
      fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0);

    btn.on('pointerdown', () => {
      this._continueBtn = null;
      onClick();
    });

    this._continueBtn = btn;
    this.ui.add(btn);
    this.ui.add(txt);
  }

  openInfoOnlyUI(title, text) {
    if (this.uiActive) return;
    this.uiActive = true;
    this.player.setVelocity(0, 0);

    const w = this.scale.width;
    const h = this.scale.height;

    const dim = this.add.rectangle(w/2, h/2, w, h, 0x000000, 0.45).setScrollFactor(0);
    const card = this.add.rectangle(w/2, h/2, Math.min(820, w-40), 300, 0x0f2a52, 0.97)
      .setScrollFactor(0);
    card.setStrokeStyle(2, 0x2e6bc2, 1);

    const t = this.add.text(w/2, h/2 - 95, title, {
      fontFamily: 'Arial',
      fontSize: '22px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0);

    const info = this.add.text(w/2, h/2 - 20, text, {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#cfe3ff',
      wordWrap: { width: Math.min(760, w-80) },
      align: 'center'
    }).setOrigin(0.5).setScrollFactor(0);

    this.ui = this.add.container(0, 0, [dim, card, t, info]).setDepth(999);

    this.renderContinueButton('OK', () => this.closeStationUI());
  }

  closeStationUI() {
    if (this.ui) this.ui.destroy(true);
    this.ui = null;
    this.uiActive = false;
    this._continueBtn = null;

    // Evita que se re-dispare al cerrar si sigues encima
    this.stationCooldownUntil = this.time.now + 900;
  }

  win() {
    if (this.won) return;
    this.won = true;

    this.player.setVelocity(0, 0);
    this.player.body.enable = false;

    const w = this.scale.width;
    const h = this.scale.height;

    this.add.text(w/2, h/2,
      `¡Misión completada! 🏁\nPuntos: ${this.score}\nEstaciones: ${this.completedStations.size}/${this.stationData.length}\n\n(Recarga la página para jugar de nuevo)`,
      {
        fontFamily: 'Arial',
        fontSize: '28px',
        color: '#ffffff',
        align: 'center',
        backgroundColor: 'rgba(0,0,0,0.35)',
        padding: { x: 18, y: 14 }
      }
    ).setOrigin(0.5).setScrollFactor(0);

    this.cameras.main.flash(250, 255, 106, 0);
  }

  // =====================================================
  // Texturas procedurales
  // =====================================================
  createProceduralTextures() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // Fondo cielo marciano (tile)
    g.fillStyle(0x071428, 1);
    g.fillRect(0, 0, 128, 128);

    for (let i = 0; i < 120; i++) {
      const x = Phaser.Math.Between(0, 127);
      const y = Phaser.Math.Between(0, 127);
      const c = Phaser.Math.Between(0x1a2d52, 0x2a3f6f);
      g.fillStyle(c, 1);
      g.fillRect(x, y, 2, 2);
    }

    g.fillStyle(0x3a140e, 0.35);
    g.fillCircle(32, 90, 34);
    g.fillCircle(92, 70, 42);

    g.generateTexture('marsSky', 128, 128);
    g.clear();

    // Suelo (256x64)
    g.fillStyle(0x7a3a1c, 1);
    g.fillRect(0, 0, 256, 64);

    for (let i = 0; i < 220; i++) {
      const x = Phaser.Math.Between(0, 255);
      const y = Phaser.Math.Between(0, 63);
      const c = Phaser.Math.Between(0x6b3117, 0x8b4a26);
      g.fillStyle(c, 1);
      g.fillRect(x, y, 2, 2);
    }

    g.fillStyle(0x4e2412, 1);
    g.fillRect(0, 0, 256, 8);

    g.generateTexture('ground', 256, 64);
    g.clear();

    // Plataforma (160x28)
    g.fillStyle(0x5b2a15, 1);
    g.fillRoundedRect(0, 0, 160, 28, 10);
    g.fillStyle(0x3f1d10, 1);
    g.fillRoundedRect(0, 0, 160, 6, 6);
    g.generateTexture('platform', 160, 28);
    g.clear();

    // Roca (44x34)
    g.fillStyle(0x2c1c16, 1);
    g.fillRoundedRect(2, 6, 40, 24, 10);
    g.fillStyle(0x3b2a22, 1);
    g.fillRoundedRect(12, 12, 16, 10, 6);
    g.generateTexture('rock', 44, 34);
    g.clear();

    // Astronauta (32x40)
    g.fillStyle(0xeaeaea, 1);
    g.fillRoundedRect(6, 6, 20, 26, 8);

    g.fillStyle(0x2d7dd2, 1);
    g.fillRoundedRect(10, 10, 12, 10, 4);

    g.fillStyle(0xff6a00, 1);
    g.fillRect(14, 24, 4, 6);

    g.fillStyle(0xbdbdbd, 1);
    g.fillRect(8, 32, 7, 6);
    g.fillRect(17, 32, 7, 6);

    g.generateTexture('astronaut', 32, 40);
    g.clear();

    // Bandera meta (24x80)
    g.fillStyle(0xffffff, 1);
    g.fillRect(10, 0, 4, 80);
    g.fillStyle(0xff6a00, 1);
    g.fillTriangle(14, 10, 24, 16, 14, 24);
    g.generateTexture('flag', 24, 80);
    g.clear();

    // Estación (40x60) como antena
    g.fillStyle(0x9bd1ff, 1);
    g.fillRoundedRect(16, 10, 8, 44, 4);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(20, 10, 10);
    g.fillStyle(0xff6a00, 1);
    g.fillRect(12, 36, 16, 10);
    g.fillStyle(0x2d7dd2, 1);
    g.fillRect(14, 38, 12, 6);
    g.generateTexture('station', 40, 60);
    g.clear();

    // Puerta (72x140)
    g.fillStyle(0x0f2a52, 1);
    g.fillRoundedRect(0, 0, 72, 140, 14);
    g.lineStyle(4, 0x2e6bc2, 1);
    g.strokeRoundedRect(3, 3, 66, 134, 12);
    g.fillStyle(0xff6a00, 1);
    g.fillRoundedRect(16, 20, 40, 28, 10);
    g.fillStyle(0xffffff, 1);
    g.fillRect(22, 28, 28, 4);
    g.generateTexture('gate', 72, 140);

    g.destroy();
  }
}

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
  scene: [MarsEduPlatformer]
};

new Phaser.Game(config);
