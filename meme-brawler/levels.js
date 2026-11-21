// ============================================================
//  LEVELS: arenas, waves, bosses
// ============================================================
'use strict';

// Each arena locks the camera and spawns waves. The last wave of a
// boss arena carries { type: 'boss' }.
// Spawn specs: { type: 'grunt'|'charger'|'thrower', side?: 'left'|'right' }
// Boss spec:   { type: 'boss', hp, scale, name }

function makeLevel1() {
  return {
    name: 'Crime Scene 1',
    width: 2800,
    arenas: [
      {
        trigger: 160,
        waves: [
          [{ type: 'grunt' }, { type: 'grunt' }],
        ],
      },
      {
        trigger: 1350,
        waves: [
          [{ type: 'grunt' }, { type: 'grunt' }, { type: 'charger' }],
        ],
      },
      {
        trigger: 2650,
        boss: true,
        waves: [
          [{ type: 'boss', hp: 220, scale: 1.0, name: 'THE SUS FACE' }],
        ],
      },
    ],
  };
}

function makeLevel2() {
  return {
    name: 'Crime Scene 2',
    width: 3400,
    arenas: [
      {
        trigger: 160,
        waves: [
          [{ type: 'grunt' }, { type: 'thrower' }],
        ],
      },
      {
        trigger: 1300,
        waves: [
          [{ type: 'charger' }, { type: 'grunt' }, { type: 'grunt' }],
        ],
      },
      {
        trigger: 2400,
        waves: [
          [{ type: 'thrower' }, { type: 'thrower' }, { type: 'charger' }],
        ],
      },
      {
        trigger: 3250,
        boss: true,
        waves: [
          [{ type: 'boss', hp: 300, scale: 1.1, name: 'THE TROLL KING' }],
        ],
      },
    ],
  };
}

function makeLevel3() {
  return {
    name: 'Crime Scene 3',
    width: 4000,
    arenas: [
      {
        trigger: 160,
        waves: [
          [{ type: 'grunt' }, { type: 'grunt' }, { type: 'grunt' }],
        ],
      },
      {
        trigger: 1200,
        waves: [
          [{ type: 'charger' }, { type: 'charger' }, { type: 'thrower' }],
        ],
      },
      {
        trigger: 2300,
        waves: [
          [{ type: 'thrower' }, { type: 'thrower' }, { type: 'grunt' }, { type: 'grunt' }],
        ],
      },
      {
        trigger: 3300,
        waves: [
          [{ type: 'charger' }, { type: 'grunt' }, { type: 'thrower' }],
        ],
      },
      {
        trigger: 3850,
        boss: true,
        waves: [
          [{ type: 'boss', hp: 380, scale: 1.25, name: 'THE FINAL MEME' }],
        ],
      },
    ],
  };
}

const LEVELS = [makeLevel1, makeLevel2, makeLevel3];
