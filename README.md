Read AGENTS.md and MEMORY.md, then continue. The 50-track step is finished; the new installer was built at 20:13 and installed at 20:15. Update MEMORY.md with that first. Then do PART A, then PART B.

PART A. Polish Melodia so it looks and behaves like a finished music app.
1. Now Playing view: clicking a track, or the cover in the bottom player, opens a panel on the right with the big cover, title, artist, the track's licence and source from credits.json, and "Next in queue". The Queue button opens the queue.
The full-screen button opens a full-screen player with the big cover, a background made from the cover's colours, the controls and the progress bar. Esc closes it.
2. Fix the track lists: the column labelled "Plays" shows the album, so rename it "Album". Read each track's real length from its MP3 and show it. Liked Songs should start empty and fill as I like songs.
3. Replace any text copied from the original app (for example "Create your first playlist" and "It's easy, we'll help you") with our own wording, or hide those cards now that the library has playlists.
4. Better covers: regenerate all 57 covers with NVIDIA's FLUX.1 Dev model, using the key in .env, as rich and varied album art that matches each playlist's mood (photography, illustration, 3D, collage). Still no text and no logos. Show me a page of the new covers and wait for my OK before swapping them in.
5. Make every button and menu work, or remove it. Click every control and list any that do nothing.
6. Design pass: refine the design system with UI/UX Pro Max, then run Impeccable's audit and polish, and fix what they find. Craft Anything's measurements of the original still win on layout.
7. Compare with the original again using Craft Anything and show how alike it is.
8. Rebuild the Windows installer, install it, and test: play a song, open the Now Playing view, the queue and full screen, search, like a song, and open Credits. Show pass or fail, and the time this part took.

PART B. Open Melodia and give me a private link to test it on my phone.
1. Open the installed Melodia app on this PC.
2. Build the web version and serve the production build on this PC, not the dev server. Make sure it can be installed as an app on Android (app name, icons, offline shell), but stream songs when they're played: don't make the phone download all the music when it installs.
3. Check the layout at phone width with Craft Anything and fix anything that doesn't fit: on a phone, the sidebar becomes a bottom bar and the player becomes a mini player that opens full screen when tapped.
4. Download Cloudflare's cloudflared from its official site or GitHub releases (not the Microsoft Store), and start a quick tunnel to the web version. This needs no account. Keep it private and don't publish the link anywhere.
5. Check the link works from this PC first. Then show it to me in bold, plus a QR code I can scan with my phone.
6. Tell me the phone steps: open the link in Chrome, then menu, then "Install app" or "Add to Home screen".
7. Keep the tunnel running until I say "stop the link", then close it.
