# cipher

Private, invite-only chat with real end-to-end encryption. No accounts, no message history, no public rooms.

---

## How it works

1. Create a room — an AES-256 encryption key is generated in your browser
2. Share the invite link with whoever you want
3. They join, messages are encrypted before leaving your device
4. The server only ever sees encrypted data — it has no access to the key
5. When everyone leaves, the room is gone

The key lives in the URL fragment (`#...`) which is never sent to the server. This is how the encryption stays end-to-end.

---

## Features

- AES-GCM 256-bit encryption via the Web Crypto API
- Invite-only rooms — no public channels
- Zero persistence — nothing stored server or client side
- Join by clicking a link or pasting it into the landing page
- Real-time presence — see who's in the room

---

## Tech stack

- **Backend:** Node.js, Express, Socket.IO
- **Frontend:** Vanilla JS, Web Crypto API
- **Crypto:** AES-GCM (messages), no external crypto libraries

---

## Running locally

```bash
git clone https://github.com/Bappipwp/cipher-chat.git
cd cipher-chat/backend
npm install
npm start
```

Open `http://localhost:3000`

---

## Security notes

- The server is a relay only — it routes encrypted blobs and never derives or stores keys
- Each message has a unique random IV
- Rooms are destroyed server-side when all users disconnect
- The URL hash containing the key is cleared from the browser address bar after joining

---

## Credits

Sebastian Marquez — [github.com/Bappipwp](https://github.com/Bappipwp)
