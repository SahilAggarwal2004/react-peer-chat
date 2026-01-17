# Changelog

## [0.11.5](https://github.com/SahilAggarwal2004/react-peer-chat/compare/v0.11.4...v0.11.5) (2026-01-17)

### Bug Fixes

* Ensure clean peer teardown and reliable reconnection with listener cleanup and scheduled retry.  ([c1a40fd](https://github.com/SahilAggarwal2004/react-peer-chat/commit/c1a40fdc490cc4079a3a88b6f7cd1777272d4f7a))

## [0.11.4](https://github.com/SahilAggarwal2004/react-peer-chat/compare/v0.11.3...v0.11.4) (2026-01-17)

### Bug Fixes

* Handle mobile reconnects and respect new connections using peerRef epochs.  ([c0cb96e](https://github.com/SahilAggarwal2004/react-peer-chat/commit/c0cb96ead59b529465d2fde0f7d04881f06fff72))

## [0.11.3](https://github.com/SahilAggarwal2004/react-peer-chat/compare/v0.11.2...v0.11.3) (2026-01-17)

### Bug Fixes

* Prefer new peer connections and clean up stale ones.  ([52fc73c](https://github.com/SahilAggarwal2004/react-peer-chat/commit/52fc73c1bf7fedd4c1966b79d16a9d5a76dc4989))

## [0.11.2](https://github.com/SahilAggarwal2004/react-peer-chat/compare/v0.11.1...v0.11.2) (2026-01-17)

### Bug Fixes

* Restore initial connections and properly close duplicates.  ([a9e3fc7](https://github.com/SahilAggarwal2004/react-peer-chat/commit/a9e3fc7c13f1a4992368cbd964c9686492b66161))

## [0.11.1](https://github.com/SahilAggarwal2004/react-peer-chat/compare/v0.11.0...v0.11.1) (2026-01-17)

### Chores

* **deps:** Update @types/react and release-it.  ([3c3ca7c](https://github.com/SahilAggarwal2004/react-peer-chat/commit/3c3ca7c6d417e07dbf7a93e616e95922262beebe))
* Rename `index.tsx` to `index.ts`.  ([7510b50](https://github.com/SahilAggarwal2004/react-peer-chat/commit/7510b50737caa53821dc4cdf8779459d22c707d4))

### Bug Fixes

* Stabilize PeerJS reconnection by resetting stale connections.  ([dae908f](https://github.com/SahilAggarwal2004/react-peer-chat/commit/dae908f120bb0514a14f4f4c8d429c20c6cd0884))

## [0.11.0](https://github.com/SahilAggarwal2004/react-peer-chat/compare/v0.10.0...v0.11.0) (2026-01-06)

### ⚠ BREAKING CHANGES

* Improve error handling and add automatic reconnection

### Features

* Improve error handling and add automatic reconnection.  ([8849276](https://github.com/SahilAggarwal2004/react-peer-chat/commit/8849276259bc32ab3715ad732017c2bd141e14d4))

## [0.10.0](https://github.com/SahilAggarwal2004/react-peer-chat/compare/v0.9.0...v0.10.0) (2026-01-05)

### Features

* Add sender name to chat messages.  ([46e8b62](https://github.com/SahilAggarwal2004/react-peer-chat/commit/46e8b62e72aa106265fe1925c5ec2c01d4ddda24))

### Bug Fixes

* Resolve WebRTC audio playback and race condition issues.  ([56ab779](https://github.com/SahilAggarwal2004/react-peer-chat/commit/56ab77960112ac0f6c02d191f486ff45c7e5aac0))

## [0.9.0](///compare/v0.8.6...v0.9.0) (2026-01-04)

### ⚠ BREAKING CHANGES

* Add multi-peer audio support, fix duplicate connections, remove audioStreamRef

### Features

* Add multi-peer audio support, fix duplicate connections, remove audioStreamRef.  b0569eb

## [0.8.6](https://github.com/SahilAggarwal2004/react-peer-chat/compare/v0.8.5...v0.8.6) (2026-01-04)

### Chores

* Rename publish script to pub.  ([eb64122](https://github.com/SahilAggarwal2004/react-peer-chat/commit/eb64122aed808884eb3229a480ebf8be93830392))

### Code Refactoring

* Modularize `index.tsx`.  ([e4bd91c](https://github.com/SahilAggarwal2004/react-peer-chat/commit/e4bd91c6bce06690dafc5803db268d06edc0c65e))

## [0.8.5](https://github.com/SahilAggarwal2004/react-peer-chat/compare/v0.8.4...v0.8.5) (2026-01-03)

### Code Refactoring

* Improve useChat lifecycle, media handling, and TypeScript safety.  ([eedcb44](https://github.com/SahilAggarwal2004/react-peer-chat/commit/eedcb449b9502047c50ac18919dec44021c815c2))

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
