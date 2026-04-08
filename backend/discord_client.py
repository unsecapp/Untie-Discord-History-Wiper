import discord
import asyncio
import threading
import aiohttp


class DiscordSelfBot:
    def __init__(self, token: str):
        self.token = token
        self.client = None
        self.ready = threading.Event()
        self._loop = None
        self._thread = None
        self._error = None

    def start(self):
        self._thread = threading.Thread(target=self._run, daemon=True)
        self._thread.start()

    def _run(self):
        self._loop = asyncio.new_event_loop()
        asyncio.set_event_loop(self._loop)

        self.client = discord.Client(loop=self._loop)

        @self.client.event
        async def on_ready():
            print(f"[Untie] Logged in as {self.client.user} ({self.client.user.id})")
            self.ready.set()

        @self.client.event
        async def on_connect():
            print("[Untie] WebSocket connected to Discord.")

        @self.client.event
        async def on_disconnect():
            print("[Untie] WebSocket disconnected from Discord.")

        try:
            self._loop.run_until_complete(self.client.start(self.token, bot=False))
        except discord.LoginFailure as e:
            print(f"[Untie] Login failed: {e}")
            self._error = "Invalid token."
            self.ready.set()
        except Exception as e:
            print(f"[Untie] Connection error: {e}")
            self._error = str(e)
            self.ready.set()

    def run_coroutine(self, coro):
        if self._loop is None:
            raise RuntimeError("Client not started")
        future = asyncio.run_coroutine_threadsafe(coro, self._loop)
        return future.result(timeout=300)

    async def _delete_message_http(self, channel_id, message_id):
        """Delete a message using direct HTTP DELETE to Discord API."""
        url = f"https://discord.com/api/v9/channels/{channel_id}/messages/{message_id}"
        headers = {"Authorization": self.token}
        async with aiohttp.ClientSession() as session:
            async with session.delete(url, headers=headers) as resp:
                if resp.status == 429:
                    data = await resp.json()
                    retry_after = data.get("retry_after", 2)
                    print(f"[Untie] Rate limited on delete, waiting {retry_after}s...")
                    await asyncio.sleep(float(retry_after))
                    async with session.delete(url, headers=headers) as retry_resp:
                        return retry_resp.status == 204
                return resp.status == 204

    async def _search_guild_messages(self, guild_id, author_id, offset=0):
        """Use Discord's search API to find messages by author in a guild."""
        url = f"https://discord.com/api/v9/guilds/{guild_id}/messages/search"
        headers = {
            "Authorization": self.token,
            "Content-Type": "application/json",
        }
        all_messages = []
        total = None

        async with aiohttp.ClientSession() as session:
            while True:
                params = {
                    "author_id": str(author_id),
                    "offset": offset,
                }
                async with session.get(url, headers=headers, params=params) as resp:
                    if resp.status == 429:
                        data = await resp.json()
                        retry_after = data.get("retry_after", 2)
                        print(f"[Untie] Rate limited, waiting {retry_after}s...")
                        await asyncio.sleep(float(retry_after))
                        continue
                    if resp.status == 403:
                        print(f"[Untie] Search forbidden in guild {guild_id}")
                        return [], 0
                    if resp.status != 200:
                        print(f"[Untie] Search error: {resp.status}")
                        return all_messages, total or 0

                    data = await resp.json()
                    total = data.get("total_results", 0)
                    messages = data.get("messages", [])

                    if not messages:
                        break

                    for group in messages:
                        for msg in group:
                            if str(msg.get("author", {}).get("id")) == str(author_id):
                                channel_obj = self.client.get_channel(int(msg["channel_id"]))
                                channel_name = getattr(channel_obj, "name", "unknown") if channel_obj else "unknown"
                                all_messages.append({
                                    "id": msg["id"],
                                    "content": msg.get("content", ""),
                                    "timestamp": msg["timestamp"],
                                    "channel_id": msg["channel_id"],
                                    "channel_name": channel_name,
                                    "attachments": [a.get("url", "") for a in msg.get("attachments", [])],
                                    "embeds": len(msg.get("embeds", [])),
                                })

                    offset += 25
                    if offset >= total:
                        break

                    await asyncio.sleep(1)

        return all_messages, total or 0

    @property
    def user(self):
        return self.client.user

    @property
    def guilds(self):
        return self.client.guilds

    @property
    def private_channels(self):
        return self.client.private_channels

    def get_guild(self, guild_id: int):
        return self.client.get_guild(guild_id)

    def get_channel(self, channel_id: int):
        return self.client.get_channel(channel_id)

    def get_user_info(self):
        u = self.client.user
        return {
            "id": str(u.id),
            "username": u.name,
            "discriminator": u.discriminator,
            "avatar": str(u.avatar_url) if u.avatar_url else None,
        }

    def get_guilds_list(self):
        guilds = []
        for g in self.client.guilds:
            guilds.append({
                "id": str(g.id),
                "name": g.name,
                "icon": str(g.icon_url) if g.icon_url else None,
                "member_count": g.member_count,
                "owner_id": str(g.owner_id),
            })
        return guilds

    def get_dms_list(self):
        dms = []
        for ch in self.client.private_channels:
            if isinstance(ch, discord.DMChannel):
                recipient = ch.recipient
                dms.append({
                    "id": str(ch.id),
                    "type": "dm",
                    "recipient": {
                        "id": str(recipient.id) if recipient else None,
                        "username": recipient.name if recipient else "Unknown",
                        "discriminator": recipient.discriminator if recipient else "0000",
                        "avatar": str(recipient.avatar_url) if recipient and recipient.avatar_url else None,
                    } if recipient else None,
                })
        return dms

    def get_group_chats_list(self):
        gcs = []
        for ch in self.client.private_channels:
            if isinstance(ch, discord.GroupChannel):
                gcs.append({
                    "id": str(ch.id),
                    "type": "group",
                    "name": ch.name or ", ".join(
                        u.name for u in ch.recipients[:3]
                    ) + ("..." if len(ch.recipients) > 3 else ""),
                    "icon": str(ch.icon_url) if ch.icon_url else None,
                    "recipient_count": len(ch.recipients),
                    "recipients": [
                        {
                            "id": str(u.id),
                            "username": u.name,
                            "avatar": str(u.avatar_url) if u.avatar_url else None,
                        }
                        for u in ch.recipients[:10]
                    ],
                })
        return gcs

    async def _fetch_messages(self, channel, limit=500):
        messages = []
        my_id = self.client.user.id
        async for msg in channel.history(limit=limit):
            if msg.author.id == my_id:
                messages.append({
                    "id": str(msg.id),
                    "content": msg.content,
                    "timestamp": msg.created_at.isoformat(),
                    "channel_id": str(msg.channel.id),
                    "channel_name": getattr(msg.channel, "name", "DM"),
                    "attachments": [a.url for a in msg.attachments],
                    "embeds": len(msg.embeds),
                })
        return messages

    def fetch_guild_activity(self, guild_id: int, limit=500):
        guild = self.get_guild(guild_id)
        if not guild:
            return {"messages": [], "total": 0}

        async def _search():
            msgs, total = await self._search_guild_messages(guild_id, self.client.user.id)
            msgs.sort(key=lambda m: m["timestamp"], reverse=True)
            return {"messages": msgs, "total": total}

        return self.run_coroutine(_search())

    def fetch_dm_activity(self, channel_id: int, limit=500):
        channel = self.get_channel(channel_id)
        if not channel:
            return []
        return self.run_coroutine(self._fetch_messages(channel, limit=limit))

    def fetch_gc_activity(self, channel_id: int, limit=500):
        channel = self.get_channel(channel_id)
        if not channel:
            return []
        return self.run_coroutine(self._fetch_messages(channel, limit=limit))

    async def _leave_guild_http(self, guild_id):
        """Leave a guild using direct HTTP DELETE."""
        url = f"https://discord.com/api/v9/users/@me/guilds/{guild_id}"
        headers = {"Authorization": self.token}
        async with aiohttp.ClientSession() as session:
            async with session.delete(url, headers=headers) as resp:
                if resp.status == 204:
                    return True
                print(f"[Untie] Failed to leave guild {guild_id}: {resp.status}")
                return False

    def leave_guild(self, guild_id: int):
        return self.run_coroutine(self._leave_guild_http(guild_id))

    async def _get_user_profile_http(self):
        """Get the current user's full profile via Discord API."""
        url = "https://discord.com/api/v9/users/@me"
        headers = {"Authorization": self.token}
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers) as resp:
                if resp.status == 200:
                    return await resp.json()
                return None

    def get_user_profile(self):
        return self.run_coroutine(self._get_user_profile_http())

    async def _update_user_profile_http(self, payload):
        """Update the current user's profile via Discord API."""
        url = "https://discord.com/api/v9/users/@me"
        headers = {
            "Authorization": self.token,
            "Content-Type": "application/json",
        }
        async with aiohttp.ClientSession() as session:
            async with session.patch(url, headers=headers, json=payload) as resp:
                if resp.status == 200:
                    return await resp.json()
                data = await resp.json()
                print(f"[Untie] Profile update failed: {resp.status} {data}")
                return {"error": data}

    def update_user_profile(self, payload: dict):
        return self.run_coroutine(self._update_user_profile_http(payload))

    def delete_messages_in_channel(self, channel_id: int, message_ids: list):
        async def _delete():
            deleted = 0
            failed = 0
            for mid in message_ids:
                success = await self._delete_message_http(channel_id, mid)
                if success:
                    deleted += 1
                    print(f"[Untie] Deleted message {mid}")
                else:
                    failed += 1
                    print(f"[Untie] Failed to delete message {mid}")
                await asyncio.sleep(0.5)
            return {"deleted": deleted, "failed": failed}
        return self.run_coroutine(_delete())

    def delete_all_in_channel(self, channel_id: int):
        async def _delete():
            deleted = 0
            failed = 0
            my_id = self.client.user.id
            channel = self.client.get_channel(channel_id)
            if not channel:
                return {"deleted": 0, "failed": 0, "error": "Channel not found"}
            async for msg in channel.history(limit=500):
                if msg.author.id == my_id:
                    success = await self._delete_message_http(channel_id, msg.id)
                    if success:
                        deleted += 1
                    else:
                        failed += 1
                    await asyncio.sleep(0.5)
            return {"deleted": deleted, "failed": failed}
        return self.run_coroutine(_delete())

    def delete_all_in_guild(self, guild_id: int):
        guild = self.get_guild(guild_id)
        if not guild:
            return {"deleted": 0, "failed": 0, "error": "Guild not found"}

        async def _delete_via_search():
            total_deleted = 0
            total_failed = 0

            msgs, total = await self._search_guild_messages(guild_id, self.client.user.id)
            print(f"[Untie] Found {total} messages to delete in {guild.name}")

            for msg_data in msgs:
                success = await self._delete_message_http(msg_data["channel_id"], msg_data["id"])
                if success:
                    total_deleted += 1
                    print(f"[Untie] Deleted message {msg_data['id']}")
                else:
                    total_failed += 1
                    print(f"[Untie] Failed to delete message {msg_data['id']}")
                await asyncio.sleep(0.5)

            return {"deleted": total_deleted, "failed": total_failed}

        return self.run_coroutine(_delete_via_search())
