import { addItem, gainExp } from './player.js';
import { ITEM_TEMPLATES } from './items.js';
import { randInt } from './utils.js';
import { WORLD } from './world.js';

const EVENT_COOLDOWN_MS = 3 * 60 * 1000;
const EVENT_CHANCE = 0.08;
const SAFE_ZONES = new Set(['bq_town', 'mg_town']);
const REWARD_ITEMS = ['potion_big', 'potion_mana_big', 'training_fruit', 'pet_training_fruit', 'treasure_exp_material'];

function normalizeRandomEventState(player) {
  if (!player.flags) player.flags = {};
  if (!player.flags.mapRandomEvents || typeof player.flags.mapRandomEvents !== 'object') {
    player.flags.mapRandomEvents = { lastAt: 0, seen: 0 };
  }
  player.flags.mapRandomEvents.lastAt = Math.max(0, Number(player.flags.mapRandomEvents.lastAt || 0));
  player.flags.mapRandomEvents.seen = Math.max(0, Math.floor(Number(player.flags.mapRandomEvents.seen || 0)));
  return player.flags.mapRandomEvents;
}

function canTriggerInRoom(player) {
  const zoneId = String(player?.position?.zone || '');
  const roomId = String(player?.position?.room || '');
  if (!zoneId || !roomId || SAFE_ZONES.has(zoneId)) return false;
  const room = WORLD[zoneId]?.rooms?.[roomId];
  if (!room) return false;
  return Array.isArray(room.spawns) && room.spawns.length > 0;
}

function grantRandomSupply(player, send) {
  const itemId = REWARD_ITEMS[randInt(0, REWARD_ITEMS.length - 1)];
  const qty = itemId === 'treasure_exp_material' ? randInt(2, 5) : 1;
  const result = addItem(player, itemId, qty);
  const itemName = result?.ok ? (ITEM_TEMPLATES[itemId]?.name || itemId) : '补给';
  send(`地图事件：你在角落里发现一只旧木箱，获得 ${itemName} x${qty}。`);
}

function grantSpiritSurge(player, send) {
  const exp = Math.max(50, Math.floor((Number(player.level || 1) * 35) + randInt(80, 220)));
  const gold = Math.max(200, Math.floor((Number(player.level || 1) * 80) + randInt(500, 1600)));
  player.gold = Math.max(0, Math.floor(Number(player.gold || 0))) + gold;
  const leveled = gainExp(player, exp);
  send(`地图事件：此地灵气涌动，你获得 ${exp} 经验和 ${gold} 金币。`);
  if (leveled) send('你升级了！');
}

function grantAmbush(player, send) {
  const maxHp = Math.max(1, Math.floor(Number(player.max_hp || 1)));
  const damage = Math.max(1, Math.floor(maxHp * randInt(4, 9) / 100));
  player.hp = Math.max(1, Math.floor(Number(player.hp || maxHp)) - damage);
  const gold = Math.max(100, Math.floor((Number(player.level || 1) * 45) + randInt(300, 900)));
  player.gold = Math.max(0, Math.floor(Number(player.gold || 0))) + gold;
  send(`地图事件：你遭遇伏击，损失 ${damage} 点生命，反击后缴获 ${gold} 金币。`);
}

export function maybeTriggerMapRandomEvent(player, { send = null, now = Date.now() } = {}) {
  if (!player || typeof send !== 'function') return null;
  if (!canTriggerInRoom(player)) return null;
  const state = normalizeRandomEventState(player);
  if (now - state.lastAt < EVENT_COOLDOWN_MS) return null;
  if (Math.random() > EVENT_CHANCE) return null;

  state.lastAt = now;
  state.seen += 1;
  const roll = Math.random();
  if (roll < 0.45) {
    grantRandomSupply(player, send);
  } else if (roll < 0.8) {
    grantSpiritSurge(player, send);
  } else {
    grantAmbush(player, send);
  }
  player.forceStateRefresh = true;
  return { ok: true };
}
