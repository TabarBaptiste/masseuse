const fs = require('fs');
const path = require('path');

const DIST = path.resolve(__dirname, '..', 'dist');
const MAX_RETRIES = 5;
const WAIT_MS = 100;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function removeDist(retries = MAX_RETRIES) {
  try {
    if (fs.existsSync(DIST)) {
      fs.rmSync(DIST, { recursive: true, force: true });
      console.log('Dossier dist supprimé');
    }
    process.exit(0);
  } catch (err) {
    if ((err.code === 'EPERM' || err.code === 'EBUSY' || err.code === 'ENOTEMPTY') && retries > 0) {
      console.warn(`removeDist: caught ${err.code}, retrying ${retries} more times...`);
      await sleep(WAIT_MS);
      return removeDist(retries - 1);
    }
    console.error('Could not remove dist:', err);
    process.exit(1);
  }
}

removeDist();
