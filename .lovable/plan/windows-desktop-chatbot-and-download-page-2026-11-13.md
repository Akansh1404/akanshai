# Windows desktop chatbot and download page

Build a Windows 10/11 desktop app that retains the existing chatbot experience, and change the public website homepage into a clear app-download page.

## User-visible changes
- Keep the existing chat, history, language and personality choices, study/fun modes, image tools, voice, and call interface in the installed app.
- Make the website homepage a branded Windows download page with a working download button and Windows 10/11 compatibility note; retain existing shared-response links.
- Do not claim Windows 7, 8, or 8.1 support. Electron removed support for those versions after v22, which is unsupported and no longer receives current fixes.

## Technical approach
- Use Electron with context isolation and Node integration disabled, Vite relative asset paths for the packaged `file://` app, and a minimal preload bridge only for desktop identification and safe external links.
- Use the existing hosted AI functions so existing modes remain available; desktop use requires an internet connection. Preserve public share links by opening website URLs externally.
- Produce a Windows x64 installer EXE if the available cross-platform packaging tools permit it. Verify that the website download points to a real same-origin installer; if the binary cannot be published from this environment, leave the download action honest and identify that hosting blocker rather than linking to a missing file.

## Verification
- Confirm the preview website shows the download page and existing shared-response route remains intact.
- Build and inspect the Windows package/installer and test its archive or executable contents where possible.
- Check the preview build log and run relevant existing tests.
