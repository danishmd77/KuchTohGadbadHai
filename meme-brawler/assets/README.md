# Custom assets

Drop your own meme faces and sounds here, then map them in
`../custom-config.js`.

## Faces (`faces/`)

Use square PNG/JPG images with a transparent or simple background.
Suggested size: 256x256 or larger.

Map them like this in `custom-config.js`:

```js
window.CUSTOM_ASSETS = {
  faces: {
    acp:     'assets/faces/acp.png',
    grunt:   'assets/faces/grunt.png',
    charger: 'assets/faces/charger.png',
    thrower: 'assets/faces/thrower.png',
    boss:    'assets/faces/boss.png'
  }
};
```

Any face you don't map keeps the built-in cartoon art.

## Sounds (`sfx/`)

Use short MP3/OGG/WAV clips. Map them like this:

```js
sfx: {
  punch:   'assets/sfx/punch.mp3',
  special: 'assets/sfx/special.mp3'
}
```

Available sound keys:

`punch, kick, hit, hurt, jump, special, boss, sting, clear, win, lose,
throw, dash, pound, ko, combo, wave, specialReady`

Any sound you don't map keeps the built-in synthesized sound.

Note: the game runs fully offline. For the Android build these files are
bundled into the APK, so re-run the build script after adding assets.
