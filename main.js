import { DiscordSDK } from "@discord/embedded-app-sdk";

// Setup scheduled message button
document.getElementById("future-btn").onclick = async () => {
  await fetch("send_future_message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ channelId: "1490576898177236992" })
  });
};

// Connect to Discord
const status = document.getElementById("status");
status.innerHTML = "Connecting to Discord...";

const sdk = new DiscordSDK("1491007176511193128");
await sdk.ready();
status.innerHTML = "Fetching User ID...";

// Authorise
const { code } = await sdk.commands.authorize({
  client_id: "1491007176511193128",
  response_type: "code",
  scope: ["identify"],
  prompt: "none"
});

// Get User ID
const userResponse = await fetch("token", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ code: code })
});
if (userResponse.ok) {
  const { user_id } = await userResponse.json();
  status.innerHTML = `Retrieving Initial Data for ${sdk.guildId}...`;

  // Retrieve Initial Data
  const initResponse = await fetch("get_initial_data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ guild_id: sdk.guildId })
  });
  if (initResponse.ok) {
    // Add buttons
    const { buttons } = await initResponse.json();
    let containerHtml = "";
    for (let i = 0; i < buttons.length; i++) { containerHtml += `<button id="btn${i}">${buttons[i]}</button>` }

    document.getElementById("btn-container").innerHTML = containerHtml;

    // Add button click handling
    for (let i = 0; i < buttons.length; i++) {
      document.getElementById(`btn${i}`).onclick = async () => {
        await fetch("activity_button_click", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: `Button ${i} clicked by <@${user_id}>`, channelId: "1490576898177236992" })
        });
      };
    }

    status.innerHTML = "Ready";
  } else { status.innerHTML = "Initial Data Retrieval Failed"; }
} else { status.innerHTML = "Fetch Failed"; }