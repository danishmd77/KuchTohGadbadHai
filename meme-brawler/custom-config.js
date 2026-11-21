// ===========================================================
//  DROP-IN OVERRIDES
// ===========================================================
// Put your own images/audio in assets/faces and assets/sfx, then map
// them here. Anything not mapped falls back to the built-in cartoon art
// and synthesized sounds.
//
// Face keys:  acp, grunt, charger, thrower, boss
// Sfx keys:   punch, kick, hit, hurt, jump, special, boss, sting,
//             clear, win, lose, throw, dash, pound, ko, combo, wave,
//             specialReady
//
// Example:
// window.CUSTOM_ASSETS = {
//   faces: {
//     acp:     'assets/faces/acp.png',
//     grunt:   'assets/faces/grunt.png',
//     boss:    'assets/faces/boss.png'
//   },
//   sfx: {
//     punch:   'assets/sfx/punch.mp3',
//     special: 'assets/sfx/special.mp3'
//   }
// };
//
// ---- CID MEME SOUNDS (MyInstants) ----
// Randomized pools live in core.js (SFX_POOLS) and pick a random CID
// sound for events like hits, hurts, spawns, chases and boss fights.

window.CUSTOM_ASSETS = {
  faces: {
    // ACP hero — rendered from the Sketchfab 3D model (CID ACP Pradhuman)
    acp: 'assets/faces/acp.png',
  },

  sfx: {
    // Primary picks (randomized pools still apply on top for hits etc.)
    punch:       'assets/sfx/hit/03_cid-120-watt.mp3',
    hit:         'assets/sfx/hit/07_cid-ke-bakchodi.mp3',
    hurt:        'assets/sfx/hurt/01_aree-cid.mp3',
    special:     'assets/sfx/special/19_masti-dekho-bc-cid-dubbing.mp3',
    boss:        'assets/sfx/boss/17_kyu-re-madarchod-cid.mp3',
    sting:       'assets/sfx/boss/17_kyu-re-madarchod-cid.mp3',
    ko:          'assets/sfx/kill/05_cid-acp-pradhuman-fasi.mp3',
    wave:        'assets/sfx/spawn/14_ek-gand-pe-repta-mara-n-sarak-pe-hagta-firega.mp3',
    clear:       'assets/sfx/win/10_cid-song.mp3',
    win:         'assets/sfx/win/10_cid-song.mp3',
  }
};
