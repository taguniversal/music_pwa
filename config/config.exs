# This file is responsible for configuring your application
# and its dependencies with the aid of the Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
import Config

config :music_pwa,
  generators: [timestamp_type: :utc_datetime]

# Configures the endpoint
config :music_pwa, MusicPwaWeb.Endpoint,
  url: [host: "localhost"],
  adapter: Bandit.PhoenixAdapter,
  render_errors: [
    formats: [html: MusicPwaWeb.ErrorHTML, json: MusicPwaWeb.ErrorJSON],
    layout: false
  ],
  manifest: [
    name: "Music PWA",
    short_name: "MusicPWA",
    icons: [
      %{src: "/images/icon-192.png", sizes: "192x192", type: "image/png"},
      %{src: "/images/icon-512.png", sizes: "512x512", type: "image/png"}
    ],
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#4a9eff",
    description: "Music visualization and control app"
  ],
  pubsub_server: MusicPwa.PubSub,
  live_view: [signing_salt: "i0AOgXoX"]

# Configures the mailer
#
# By default it uses the "Local" adapter which stores the emails
# locally. You can see the emails in your browser, at "/dev/mailbox".
#
# For production it's recommended to configure a different adapter
# at the `config/runtime.exs`.
config :music_pwa, MusicPwa.Mailer, adapter: Swoosh.Adapters.Local

# Configure esbuild (the version is required)
config :esbuild,
  version: "0.17.11",
  music_pwa: [
    args:
      ~w(js/app.js --bundle --target=es2017 --outdir=../priv/static/assets --external:/fonts/* --external:/images/*),
    cd: Path.expand("../assets", __DIR__),
    env: %{"NODE_PATH" => Path.expand("../deps", __DIR__)}
  ]

# Configure tailwind (the version is required)
config :tailwind,
  version: "3.4.3",
  music_pwa: [
    args: ~w(
      --config=tailwind.config.js
      --input=css/app.css
      --output=../priv/static/assets/app.css
    ),
    cd: Path.expand("../assets", __DIR__)
  ]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{config_env()}.exs"
