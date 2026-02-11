require("dotenv").config();

const config = {
  PORT: process.env.PORT,
  API_BASE_URL: "https://www.naukri.com",
  JWT_SECRET: process.env.JWT_SECRET,
  HEADERS: {
    accept: "application/json",
    appid: "109",
    clientid: "d3skt0p",
    systemid: "Naukri",
    "user-agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36",
    nkparam:
      "YTaInE5VFOxLIBCwBThpk9FKpkizF6mfRCKjE9NJEEtBYLImu/dHn0EvpEzZKmJsZq0pkbQDYh79GCPCDm0PyQ==",
  },
};

module.exports = config;
