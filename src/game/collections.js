import { ITEM_TEMPLATES } from './items.js';

const RARITY_ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'supreme', 'ultimate'];
const RARITY_LABELS = {
  common: '普通',
  uncommon: '优秀',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
  supreme: '至尊',
  ultimate: '终极'
};
const EQUIPMENT_TYPES = new Set(['weapon', 'armor', 'accessory']);

function rarityOf(item) {
  if (!item) return 'common';
  if (item.rarity) return String(item.rarity);
  const price = Number(item.price || 0);
  if (price >= 80000) return 'legendary';
  if (price >= 30000) return 'epic';
  if (price >= 10000) return 'rare';
  if (price >= 2000) return 'uncommon';
  return 'common';
}

function isCodexEquipment(item) {
  return item && item.slot && EQUIPMENT_TYPES.has(item.type);
}

export function getEquipmentCodexDefs() {
  return Object.values(ITEM_TEMPLATES)
    .filter(isCodexEquipment)
    .map((item) => ({
      id: item.id,
      name: item.name || item.id,
      slot: item.slot,
      type: item.type,
      rarity: rarityOf(item)
    }))
    .sort((a, b) => {
      const rarityDiff = (RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity));
      if (rarityDiff) return rarityDiff;
      return a.name.localeCompare(b.name, 'zh-Hans-CN');
    });
}

function normalizeCodex(player) {
  if (!player.flags) player.flags = {};
  if (!player.flags.equipmentCodex || typeof player.flags.equipmentCodex !== 'object') {
    player.flags.equipmentCodex = { unlocked: {} };
  }
  if (!player.flags.equipmentCodex.unlocked || typeof player.flags.equipmentCodex.unlocked !== 'object') {
    player.flags.equipmentCodex.unlocked = {};
  }
  return player.flags.equipmentCodex;
}

export function recordEquipmentCodexItem(player, itemId) {
  const item = ITEM_TEMPLATES[itemId];
  if (!player || !isCodexEquipment(item)) return { unlocked: false };
  const codex = normalizeCodex(player);
  if (codex.unlocked[itemId]) return { unlocked: false };
  codex.unlocked[itemId] = Date.now();
  return {
    unlocked: true,
    itemId,
    itemName: item.name || itemId,
    rarity: rarityOf(item)
  };
}

export function getEquipmentCodexBonus(player) {
  const codex = normalizeCodex(player);
  const defs = getEquipmentCodexDefs();
  const unlocked = new Set(Object.keys(codex.unlocked || {}));
  const counts = {};
  RARITY_ORDER.forEach((rarity) => { counts[rarity] = 0; });
  defs.forEach((def) => {
    if (unlocked.has(def.id)) counts[def.rarity] = Math.max(0, Number(counts[def.rarity] || 0)) + 1;
  });
  const score =
    counts.common * 1 +
    counts.uncommon * 2 +
    counts.rare * 4 +
    counts.epic * 8 +
    counts.legendary * 14 +
    counts.supreme * 24 +
    counts.ultimate * 40;
  return {
    max_hp: Math.floor(score * 8),
    max_mp: Math.floor(score * 4),
    atk: Math.floor(score / 8),
    def: Math.floor(score / 10),
    mag: Math.floor(score / 8),
    spirit: Math.floor(score / 8),
    mdef: Math.floor(score / 10),
    dex: Math.floor(score / 18),
    score,
    counts
  };
}

export function buildEquipmentCodexPayload(player) {
  const codex = normalizeCodex(player);
  const defs = getEquipmentCodexDefs();
  const unlocked = codex.unlocked || {};
  const total = defs.length;
  const unlockedCount = defs.filter((def) => unlocked[def.id]).length;
  const byRarity = {};
  RARITY_ORDER.forEach((rarity) => {
    const rarityDefs = defs.filter((def) => def.rarity === rarity);
    byRarity[rarity] = {
      key: rarity,
      label: RARITY_LABELS[rarity] || rarity,
      total: rarityDefs.length,
      unlocked: rarityDefs.filter((def) => unlocked[def.id]).length
    };
  });
  const bonus = getEquipmentCodexBonus(player);
  const recent = Object.entries(unlocked)
    .map(([id, at]) => ({ id, at: Number(at || 0), name: ITEM_TEMPLATES[id]?.name || id, rarity: rarityOf(ITEM_TEMPLATES[id]) }))
    .sort((a, b) => b.at - a.at)
    .slice(0, 12);
  return {
    total,
    unlocked: unlockedCount,
    percent: total > 0 ? Math.floor(unlockedCount * 1000 / total) / 10 : 0,
    byRarity,
    bonus,
    recent
  };
}

export function formatEquipmentCodexLines(player) {
  const payload = buildEquipmentCodexPayload(player);
  const rarityLines = RARITY_ORDER
    .map((rarity) => payload.byRarity[rarity])
    .filter((entry) => entry.total > 0)
    .map((entry) => `${entry.label} ${entry.unlocked}/${entry.total}`);
  const b = payload.bonus || {};
  const bonusText = [
    b.max_hp ? `生命+${b.max_hp}` : '',
    b.max_mp ? `魔法+${b.max_mp}` : '',
    b.atk ? `攻击+${b.atk}` : '',
    b.def ? `防御+${b.def}` : '',
    b.mag ? `魔法+${b.mag}` : '',
    b.spirit ? `道术+${b.spirit}` : '',
    b.mdef ? `魔御+${b.mdef}` : '',
    b.dex ? `敏捷+${b.dex}` : ''
  ].filter(Boolean).join('、') || '暂无';
  const recentText = payload.recent.length
    ? payload.recent.map((entry) => `${entry.name}(${RARITY_LABELS[entry.rarity] || entry.rarity})`).join('、')
    : '暂无';
  return [
    `装备图鉴：${payload.unlocked}/${payload.total}（${payload.percent}%）`,
    `稀有度进度：${rarityLines.join(' / ')}`,
    `永久加成：${bonusText}`,
    `最近点亮：${recentText}`
  ];
}
