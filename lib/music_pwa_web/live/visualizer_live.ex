# lib/music_pwa_web/live/visualizer_live.ex
defmodule MusicPwaWeb.VisualizerLive do
  use MusicPwaWeb, :live_view

  def mount(_params, _session, socket) do
    {:ok, socket}
  end

  def render(assigns) do
    ~H"""
    Click in recetangle to start/stop.
    Press 'v' to change visualization

    <div class="w-full h-screen bg-black">
      <canvas id="visualizer" phx-hook="Visualizer"></canvas>
    </div>
    """
  end
end
