# 0.8.1 (01-03-2025)

- **chore:** Replaced `tsc` with `tsup` for faster and optimized bundling.
- **chore:** No longer required to import `react-peer-chat/styles.css` manually.

## 0.8.0 (06-12-2024)

- **feat:** Support for React.js v19 to ensure compatibility with the latest features.

## 0.7.0 (02-12-2024)

- **feat:** `useChat` hook added.
- **feat:** `onMessageSent` and `onMessageReceived` props in `<Chat>` component.
- **chore:** Renamed `voice` prop to `audio` in `<Chat>` component.
- **chore:** Renamed `addMessage` function to `sendMessage` in the FaC of the `<Chat>` component.
- **docs:** Restructured and refined documentation for better clarity and navigation.

## 0.6.2 (19-01-2024)

- **improve:** Default icons for enhanced user experience.

## 0.6.1 (15-01-2024)

- **docs:** Added guide to configure custom ICE/TURN servers. See [Custom ICE Servers](https://www.npmjs.com/package/react-peer-chat#custom-ice-servers)

## 0.6.0 (14-01-2024)

- **feat:** Free [TURN server](https://webrtc.org/getting-started/turn-server) service, replacing the `peerjs` service (discontinued as per [this discussion](https://github.com/orgs/peers/discussions/1172))

## 0.5.4 (06-12-2023)

- **deps:** Updated the `peerjs` dependency to version `1.5.2`.

## 0.5.2 (14-10-2023)

- **docs:** Updated description of `children` prop of `<Chat>` component.

## 0.5.0 (28-09-2023)

- **feat:** `recoverChat` prop in `<Chat>` component.
- **deps:** Updated the `peerjs` dependency to version `1.5.1`.
