const fetch = require('node-fetch');

class Database {
  constructor(authToken, guildId, options) {
    this.authToken = authToken;
    this.guildId = guildId;
    this.embedName = options?.embedName ?? 'probot.db';
    this.baseUrl = options?.baseUrl ?? 'https://api.probot.io';
  }

  async _request(endpoint, method, body = {}) {
    return (
      await fetch(this.baseUrl + endpoint, {
        headers: {
          Authorization: this.authToken,
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; rv:91.0) Gecko/20100101 Firefox/91.0',
        },
        body: method !== 'GET' ? JSON.stringify({ access: this.authToken, guild_id: this.guildId, ...body }) : null,
        json: true,
        method,
      })
    ).json();
  }

  async _updateEmbed(id, data) {
    return this._request('/', 'PUT', {
      method: 'UPDATE_EMBED',
      embed: { _id: id, content: JSON.stringify(data), embed: {}, guild: this.guildId, name: this.embedName, sent: [] },
    });
  }

  async _fetchEmbed() {
    let data = await this._request(`/${this.guildId}/embeds`, 'GET');
    let embed = data.find((e) => e.name === this.embedName);

    if (!embed) {
      data = await this._request('/', 'PUT', { method: 'ADD_EMBED' });
      embed = data.at(-1);
    }

    if (!embed.content) {
      await this._updateEmbed(embed._id, {});
      embed.content = '{}';
    }

    return { id: embed._id, data: JSON.parse(embed.content) };
  }

  async get(key) {
    return (await this._fetchEmbed()).data[key];
  }

  async set(key, value) {
    const { id, data } = await this._fetchEmbed();
    data[key] = value;
    return this._updateEmbed(id, data);
  }

  async delete(key) {
    const { id, data } = await this._fetchEmbed();
    delete data[key];
    return this._updateEmbed(id, data);
  }

  async clear() {
    const { id: embed_id } = await this._fetchEmbed();
    return this._request('/', 'PUT', { method: 'DELETE_EMBED', embed_id });
  }
}

module.exports = Database;
