const { onRequest } = require("firebase-functions/https");
const admin = require("firebase-admin");
//const { getFunctions } = require("firebase-admin/functions");

admin.initializeApp();
const db = admin.firestore();

exports.token = onRequest({ secrets: ["DISCORD_CLIENT_SECRET"] }, async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) {
            return res.status(400).json({ error: "Missing code" });
        }

        const response = await fetch("https://discord.com/api/v10/oauth2/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                client_id: "1491007176511193128",
                client_secret: process.env.DISCORD_CLIENT_SECRET,
                grant_type: "authorization_code",
                code: code,
                redirect_uri: "https://127.0.0.1" //https://us-central1-when2riot-dev.cloudfunctions.net/token
            }).toString()
        });
        const data = await response.json();
        if (!response.ok) { return res.status(response.status).json(data); }

        const userRes = await fetch("https://discord.com/api/v10/users/@me", {
            headers: { Authorization: `Bearer ${data.access_token}` }
        });
        const user = await userRes.json();
        if (!userRes.ok) { return res.status(userRes.status).json(user); }
        return res.json({ user_id: user.id });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
});

exports.send_message = onRequest({ secrets: ["DISCORD_TOKEN"] }, async (req, res) => {
    try {
        const { content, channelId } = req.body;
        if (!content || !channelId) {
            return res.status(400).json({ error: "Missing code" });
        }

        const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
            method: "POST",
            headers: { "Authorization": `Bot ${process.env.DISCORD_TOKEN}`, "Content-Type": "application/json" },
            body: JSON.stringify({ content: content })
        });
        const messageRes = await response.json();
        if (!response.ok) { return res.status(response.status).json(messageRes); }
        return res.json(messageRes);
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

exports.get_initial_data = onRequest(async (req, res) => {
    try {
        const { guild_id } = req.body;
        if (!guild_id) {
            return res.status(400).json({ error: "Missing guild_id" });
        }

        const docRef = db.collection("Guild_Buttons").doc(guild_id);
        const docSnap = await docRef.get();
        if (docSnap.exists) { return res.json(docSnap.data()); }

        const newData = { buttons: [] };
        await docRef.set(newData);
        return res.json(newData);
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

exports.send_future_message = onRequest(async (req, res) => {
    try {
        const { channelId } = req.body;
        if (!channelId) {
            return res.status(400).json({ error: "Missing code" });
        }

        // await getFunctions().taskQueue("processTask").enqueue(
        //     { content: "Example scheduled message", channelId: channelId },
        //     { scheduleTime: new Date(Date.now() + 30 * 1000) } // 30 seconds
        // );
        res.json({ message: "Task scheduled!" });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});