const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function filePath(name) {
  return path.join(DATA_DIR, `${name}.json`);
}

function readAll(name) {
  const fp = filePath(name);
  if (!fs.existsSync(fp)) return [];
  try { return JSON.parse(fs.readFileSync(fp, 'utf8')); } catch { return []; }
}

function writeAll(name, data) {
  fs.writeFileSync(filePath(name), JSON.stringify(data, null, 2));
}

module.exports = {
  // Generic CRUD
  find(collection, predicate) {
    const rows = readAll(collection);
    return predicate ? rows.filter(predicate) : rows;
  },

  findOne(collection, predicate) {
    return readAll(collection).find(predicate) || null;
  },

  insert(collection, record) {
    const rows = readAll(collection);
    rows.push(record);
    writeAll(collection, rows);
    return record;
  },

  update(collection, predicate, updater) {
    const rows = readAll(collection);
    const updated = rows.map(r => predicate(r) ? { ...r, ...updater(r) } : r);
    writeAll(collection, updated);
    return updated.find(predicate) || null;
  },

  remove(collection, predicate) {
    const rows = readAll(collection);
    writeAll(collection, rows.filter(r => !predicate(r)));
  },
};
