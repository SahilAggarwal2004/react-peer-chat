const turnAccounts = [
  { username: "70061a377b51f3a3d01c11e3", credential: "lHV4NYJ5Rfl5JNa9" },
  { username: "13b19eb65bbf6e9f96d64b72", credential: "7R9P/+7y7Q516Etv" },
  { username: "3469603f5cdc7ca4a1e891ae", credential: "/jMyLSDbbcgqpVQv" },
  { username: "a7926f4dcc4a688d41f89752", credential: "ZYM8jFYeb8bQkL+N" },
  { username: "0be25ab7f61d9d733ba94809", credential: "hiiSwWVch+ftt3SX" },
  { username: "3c25ba948daeab04f9b66187", credential: "FQB3GQwd27Y0dPeK" },
];

export const defaultConfig = {
  iceServers: [
    {
      urls: ["stun:stun.l.google.com:19302", "stun:stun.relay.metered.ca:80"],
    },
  ].concat(
    turnAccounts.map((account) => ({
      urls: ["turn:standard.relay.metered.ca:80", "turn:standard.relay.metered.ca:80?transport=tcp", "turn:standard.relay.metered.ca:443", "turns:standard.relay.metered.ca:443?transport=tcp"],
      ...account,
    }))
  ),
};
