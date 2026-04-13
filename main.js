import { DiscordSDK } from "@discord/embedded-app-sdk";

const status = document.getElementById("status");
const btn = document.getElementById("btn");
const count = document.getElementById("count");
status.innerHTML = "Connecting to Discord...";

const sdk = new DiscordSDK("1491007176511193128");
await sdk.ready();
status.innerHTML = "Fetching User ID...";

const { code } = await sdk.commands.authorize({
  client_id: "1491007176511193128",
  response_type: "code",
  scope: ["identify"],
  prompt: "none"
});
const res = await fetch("token", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ code }),
});
if (res.ok) {
  const { user_id } = await res.json();
  let clickCount = 0;
  status.innerHTML = "Ready";
  btn.disabled = false;
  btn.onclick = async () => {
    await fetch("activity_button_click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: `Button clicked by <@${user_id}>`, channelId: "1490576898177236992" })
    });
    count.innerHTML = ++clickCount;
  };
} else { status.innerHTML = "Fetch Failed"; }