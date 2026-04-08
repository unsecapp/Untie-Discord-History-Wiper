import time
from flask import Flask, jsonify, request
from flask_cors import CORS
from discord_client import DiscordSelfBot

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

bot: DiscordSelfBot = None
connected = False


def get_bot():
    global bot, connected
    if bot is None or not connected:
        return None
    return bot


@app.route("/api/connect", methods=["POST"])
def connect():
    global bot, connected
    data = request.json or {}
    token = data.get("token")

    if not token:
        return jsonify({"error": "No token provided"}), 400

    if bot and connected:
        return jsonify({"message": "Already connected", "user": bot.get_user_info()})

    try:
        bot = DiscordSelfBot(token)
        bot.start()

        if not bot.ready.wait(timeout=30):
            bot = None
            return jsonify({"error": "Connection timed out"}), 504

        if bot._error:
            err = bot._error
            bot = None
            return jsonify({"error": err}), 401

        connected = True
        return jsonify({"message": "Connected", "user": bot.get_user_info()})
    except Exception as e:
        bot = None
        connected = False
        return jsonify({"error": str(e)}), 500


@app.route("/api/disconnect", methods=["POST"])
def disconnect():
    global bot, connected
    connected = False
    bot = None
    return jsonify({"message": "Disconnected"})


@app.route("/api/status")
def status():
    b = get_bot()
    if not b:
        return jsonify({"connected": False})
    return jsonify({"connected": True, "user": b.get_user_info()})


@app.route("/api/guilds")
def guilds():
    b = get_bot()
    if not b:
        return jsonify({"error": "Not connected"}), 401
    return jsonify(b.get_guilds_list())


@app.route("/api/dms")
def dms():
    b = get_bot()
    if not b:
        return jsonify({"error": "Not connected"}), 401
    return jsonify(b.get_dms_list())


@app.route("/api/groupchats")
def groupchats():
    b = get_bot()
    if not b:
        return jsonify({"error": "Not connected"}), 401
    return jsonify(b.get_group_chats_list())


@app.route("/api/guild/<guild_id>/activity")
def guild_activity(guild_id):
    b = get_bot()
    if not b:
        return jsonify({"error": "Not connected"}), 401
    result = b.fetch_guild_activity(int(guild_id))
    return jsonify(result)


@app.route("/api/channel/<channel_id>/activity")
def channel_activity(channel_id):
    b = get_bot()
    if not b:
        return jsonify({"error": "Not connected"}), 401
    limit = request.args.get("limit", 500, type=int)
    messages = b.fetch_dm_activity(int(channel_id), limit=limit)
    return jsonify(messages)


@app.route("/api/guild/<guild_id>/delete", methods=["POST"])
def delete_guild_messages(guild_id):
    b = get_bot()
    if not b:
        return jsonify({"error": "Not connected"}), 401
    result = b.delete_all_in_guild(int(guild_id))
    return jsonify(result)


@app.route("/api/channel/<channel_id>/delete", methods=["POST"])
def delete_channel_messages(channel_id):
    b = get_bot()
    if not b:
        return jsonify({"error": "Not connected"}), 401

    data = request.json or {}
    message_ids = data.get("message_ids")

    if message_ids:
        result = b.delete_messages_in_channel(int(channel_id), message_ids)
    else:
        result = b.delete_all_in_channel(int(channel_id))
    return jsonify(result)


@app.route("/api/guild/<guild_id>/leave", methods=["POST"])
def leave_guild(guild_id):
    b = get_bot()
    if not b:
        return jsonify({"error": "Not connected"}), 401
    success = b.leave_guild(int(guild_id))
    if success:
        return jsonify({"message": "Left server"})
    return jsonify({"error": "Failed to leave server"}), 400


@app.route("/api/user/profile")
def user_profile():
    b = get_bot()
    if not b:
        return jsonify({"error": "Not connected"}), 401
    profile = b.get_user_profile()
    if profile:
        return jsonify(profile)
    return jsonify({"error": "Failed to fetch profile"}), 500


@app.route("/api/user/profile", methods=["PATCH"])
def update_profile():
    b = get_bot()
    if not b:
        return jsonify({"error": "Not connected"}), 401
    data = request.json or {}
    result = b.update_user_profile(data)
    if "error" in result:
        return jsonify(result), 400
    return jsonify(result)


if __name__ == "__main__":
    print("[Untie] Backend running on http://localhost:5000")
    app.run(host="0.0.0.0", port=5000, debug=False, threaded=True)
