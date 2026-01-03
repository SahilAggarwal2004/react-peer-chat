# Changelog

## [0.8.4](https://github.com/SahilAggarwal2004/react-peer-chat/compare/v0.8.3...v0.8.4) (2026-01-03)

### Chores

* Add publish script to package.json.  ([8057790](https://github.com/SahilAggarwal2004/react-peer-chat/commit/80577906f6eae86abffab79c754d4e61ffaa0d46))

### Code Refactoring

* Move utility files from src/modules to src/lib.  ([0a20280](https://github.com/SahilAggarwal2004/react-peer-chat/commit/0a20280178ac5aca41c8701b126af02c8703f6e2))

### Build System

* Mark package as side effect free for JavaScript while preserving CSS imports.  ([4aa1e9a](https://github.com/SahilAggarwal2004/react-peer-chat/commit/4aa1e9aa1480325a1a0bcc8288c16ac8a60e149b))

## [0.8.3](https://github.com/SahilAggarwal2004/react-peer-chat/compare/v0.8.2...v0.8.3) (2026-01-02)

### Chores

* Add release-it for automated versioning and changelog.  ([1eba520](https://github.com/SahilAggarwal2004/react-peer-chat/commit/1eba52004adeefa703cd30d7bbcbde9b9749cbb0))
* **deps:** Update `peerjs`, `@types/react`, `tsup` and `typescript`.  ([b938534](https://github.com/SahilAggarwal2004/react-peer-chat/commit/b938534d953828c6a796f4e833cc870096d06604))

### Documentation

* Correct hook name from `useSpeech` to `useChat`.  ([c9a6342](https://github.com/SahilAggarwal2004/react-peer-chat/commit/c9a63427c66edb2d8c73c351b8be91dad51e4923))

## 0.8.2 (2025-03-01)

* **fix:** Ensure audio is enabled only when both the audio setting and the allowed flag are true.

## 0.8.1 (2025-03-01)

* **chore:** Replaced `tsc` with `tsup` for faster and optimized bundling.
* **chore:** No longer required to import `react-peer-chat/styles.css` manually.

## 0.8.0 (2024-12-06)

* **feat:** Support for React.js v19 to ensure compatibility with the latest features.

## 0.7.0 (2024-12-02)

* **feat:** `useChat` hook added.
* **feat:** `onMessageSent` and `onMessageReceived` props in `<Chat>` component.
* **chore:** Renamed `voice` prop to `audio` in `<Chat>` component.
* **chore:** Renamed `addMessage` function to `sendMessage` in the FaC of the `<Chat>` component.
* **docs:** Restructured and refined documentation for better clarity and navigation.

## 0.6.2 (2024-01-19)

* **improve:** Default icons for enhanced user experience.

## 0.6.1 (2024-01-15)

* **docs:** Added guide to configure custom ICE/TURN servers. See [Custom ICE Servers](https://www.npmjs.com/package/react-peer-chat#custom-ice-servers)

## 0.6.0 (2024-01-14)

* **feat:** Free [TURN server](https://webrtc.org/getting-started/turn-server) service, replacing the `peerjs` service (discontinued as per [this discussion](https://github.com/orgs/peers/discussions/1172))

## 0.5.4 (2023-12-06)

* **deps:** Updated the `peerjs` dependency to version `1.5.2`.

## 0.5.2 (2023-10-14)

* **docs:** Updated description of `children` prop of `<Chat>` component.

## 0.5.0 (2023-09-28)

* **feat:** `recoverChat` prop in `<Chat>` component.
* **deps:** Updated the `peerjs` dependency to version `1.5.1`.
