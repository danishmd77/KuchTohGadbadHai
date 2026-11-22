Recreate an app using Craft Anything. Follow PART 1 to PART 4 in order.

PART 1. RULES (they apply for the whole session)
1. Before every step, announce it: "Engine: <the engine or tool you're using for this step>. Task: <what this step does, in plain English>."
2. Whenever you download or install anything, write it in bold: what it is, where it came from, and how many files or how much was downloaded.
3. Whenever there's an error or issue, write it in bold, explain it in plain English, then fix it.
4. Keep a running count: files downloaded, files you're working on, and engines running.
5. After each step, run a test to check it worked, and show pass or fail.
6. Do everything yourself. Only ask me what you can't decide on your own.
7. When you ask me something, give me options to click if you can, otherwise numbered options, and mark the one you recommend.
8. Never ask me to paste a password or API key into this chat, never print one, and never show what's inside a .env file.
9. Note the time each step starts and ends.
10. If you hit a usage limit, keep failing, or need me to restart something: first update MEMORY.md, then stop and tell me in bold what to do, step by step, and give me the exact line to type when I'm back.

PART 2. MEMORY FILES (so any model can pick up where you left off)
- If AGENTS.md and MEMORY.md already exist in this folder, don't recreate them. Read MEMORY.md and continue from the step it names.
- Otherwise, create them now:
  - AGENTS.md: this whole message, word for word. OpenCode loads it automatically in every new chat in this folder.
  - MEMORY.md: where we are, under these headings: Current step, Next action, My choices so far, Important paths and commands, Done, Problems and fixes, Time per step.
- Update MEMORY.md at the end of every step, before you ask me anything.
- Whenever I switch the model or come back after a restart, read MEMORY.md first, then continue.

PART 3. USING CRAFT ANYTHING
- Use Craft Anything through its tools connected to OpenCode (MCP). Use its command-line program for setup, the health check and picture-taking tools (see below). It may not be on the PATH, so find where it's installed and save the full path in MEMORY.md.
- Craft Anything shows a small set of tools at first. Use its list_toolsets and enable_toolset tools to turn on only the toolsets you need. If tools you turned on don't show up for you, tell me in bold.
- If the original has both an app and a website, study both: the website for exact measurements at desktop and phone widths, and the installed app's window for the signed-in look. The window picture tool opens the app by itself, so the app must be closed first.
- Save its captures and comparisons in a folder called craft in this folder.
- Never let picture data come into this chat. Craft Anything's window pictures and page screenshots can return huge picture data, so run those tools from its command-line program with --allow-run and --output to save the PNG, send the printed result to a log file, and only open the saved PNG. For websites, use its website-capture tool, which saves its pictures to files. Read big files, like UI maps, in parts.
- If studying the original needs something that isn't ready on this computer (the app installed, me signed in, or an engine), stop and tell me in bold exactly what to install or do, step by step, then wait until I type "done". Never sign in for me or ask for my password.
- Install apps and programs only from their official website's download, never from the Microsoft Store (including winget's Microsoft Store source): Craft Anything can't take pictures of Store apps.
- If you need screens you can't capture yourself, tell me which screenshots to take and where to save them.
- Don't copy my personal details (account name, playlists, photos) from the original into my app.
- Don't use its "rebuild" or "chat" commands: they start a second AI. You are the builder.

PART 4. THE STEPS
Step 1. Connect Craft Anything.
- If its tools aren't connected to you in this chat yet: connect Craft Anything to OpenCode with its own setup command, then add --allow-run to the craft-anything command in OpenCode's config file (opencode.json). I approve this: it lets Craft Anything open websites and run its tools without asking me each time. Then follow rule 10, because OpenCode needs a restart to load the tools.
- If they are connected: run its health check and tell me in bold "Craft Anything tools loaded ✅" and how many tools you can see.

Step 2. Ask me what I want to recreate: a website, a desktop app, a phone app or a game. Wait for my answer.

Step 3. Work out what Craft Anything needs to study that kind of target: turn on the matching toolset, list the engines involved and whether each one is installed. Don't install anything yet.

Step 4. Ask me which app or website I want to recreate and what it should do. Wait for my answer. Then check the original is ready to study on this computer (installed, and signed in if needed). If it isn't, follow PART 3 and wait for my "done".

Step 5. Ask me which mode to use, with one short line on each:
- Clean room: it only looks at the original the way any user sees it, and reads nothing inside it.
- Deep: it also reads the original's code and files, for private study.
Recommend one and say why. Craft Anything is set to Clean room now. If I pick Deep, change its setting and follow rule 10.

Step 6. Legal and ethical check. Look up the original's terms of service and anything about trademarks, copyright and reverse engineering. Tell me in plain English what we may do and what we must not do (for example: copying its name, logo, artwork, music, text or code, or getting around logins or copy protection). Then stop and wait for my approval.

Step 7. After I approve, give me:
- 4 to 5 original names for my app, none using the original's name.
- 4 to 5 icon options as real images, made with NVIDIA's FLUX.2 Klein image model. Each icon should fill the whole image edge to edge, with no background or shadow around it. For the key: if a .env file with NVIDIA_API_KEY already exists here, use it. Otherwise create .env containing only NVIDIA_API_KEY=, add it to .gitignore, open it in Notepad, then stop and ask me to paste my key, save, close Notepad and type "saved". Read the key from the file inside the command itself. Save the icons in an icons folder and show them side by side in a browser page, with your pick. If image creation fails, tell me in bold and draw the icons yourself instead.
- The plan: the screens and features you'll build, in order, and how you'll use Craft Anything to compare the result with the original.
- Where it should run: web, Windows desktop and/or Android phone (I can pick more than one). Recommend the simplest way to cover what I pick.
- Wherever there's more than one engine to choose from, ask me which one, recommend one and say why.
Wait for my choices.

Step 8. Design skills. Ask me which design skills to add, so the app looks professional and not AI-made. I can pick more than one. Offer 4 to 6 well-known design skills from GitHub (for example Impeccable, UI/UX Pro Max, Hallmark, Taste Skill and Anthropic's frontend-design), one line each: what it's best at, and whether it suits an app or is made for landing pages. Mark the ones you recommend.
Also offer "I'll paste GitHub links to my own favourite skills" and "No skill".
Wait for my choice.
If I pick more than one: say which one leads the design and which ones you'll only use to check and polish, list any of their rules that clash and how you'll settle them, and ask me to confirm. The original's layout, as Craft Anything measured it, always wins over any skill.
Before downloading each skill, tell me its repo and licence. Install it in this folder rather than for the whole computer where possible, read its instructions, and ask me before running any scripts that come with it. Only use the skills I pick here, even if other skills are already installed on this computer.
When they're installed, tell me in bold that each skill is installed and ready, and run a quick test of each one (for example a design-system search or a slop check on a small sample page), showing pass or fail.

Step 9. Build. Install the engines you need, then build my app in a new folder called app. Prefer well-known, well-documented libraries and name them in bold. Use placeholder songs and cover pictures for now, and make empty music and images folders for mine. Use Craft Anything to study the original. Then run my app on this computer, capture it with Craft Anything the same way, and compare the two. Before each comparison, format the code, check it for errors and run its tests. Show how alike it is after each check, and keep improving until it's close. When it's close, make it work everywhere I picked in Step 7, and test that it installs as an app on this computer.

Step 10. When the build works, stop and ask me for my music and pictures. Then give me a short report: the time for each step and in total, files written, checks passed, how alike it is, how to open it on each device, and where in OpenCode I can see the tokens used.
