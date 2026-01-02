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
