#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { File } = require('node:buffer');

function arg(name, fallback) {
  const i = process.argv.indexOf(name);
  if (i < 0 || i + 1 >= process.argv.length) return fallback;
  return process.argv[i + 1];
}

function hasFlag(name) {
  return process.argv.includes(name);
}

const projectRoot = path.resolve(__dirname, '..');
const encodeReply = require(path.join(
  projectRoot,
  'dianych-website/node_modules/next/dist/compiled/react-server-dom-webpack/client.node'
)).encodeReply;

const baseUrl = arg('--base-url', 'http://127.0.0.1:13001');
const actionId = arg('--action-id', '');
const cookie = arg('--cookie', '');
const folder = arg('--folder', '');
const filePath = arg('--file', '');
const filename = arg('--filename', filePath ? path.basename(filePath) : '');
const imagePath = arg('--image-path', '');
const oversizeMb = Number.parseInt(arg('--oversize-mb', '0'), 10) || 0;

if (!actionId) {
  process.stderr.write('missing --action-id\n');
  process.exit(2);
}

const form = new FormData();
if (folder) form.append('folder', folder);
if (imagePath) form.append('imagePath', imagePath);
if (oversizeMb > 0) {
  form.append(
    'files',
    new File([Buffer.alloc(oversizeMb * 1024 * 1024)], filename || 'bbtest-huge.jpg', {
      type: 'image/jpeg',
    })
  );
} else if (filePath === '') {
  if (hasFlag('--empty-file')) {
    form.append('files', new File([], filename || 'empty.jpg', { type: 'image/jpeg' }));
  }
} else if (filePath) {
  form.append(
    'files',
    new File([fs.readFileSync(filePath)], filename, { type: arg('--type', 'image/jpeg') })
  );
}

const tree =
  '["",{"children":["manage",{"children":["__PAGE__",{},null,null]},null,null]},null,null,true]';

encodeReply([{ message: '', status: 'idle' }, form])
  .then(async (body) => {
    const headers = {
      'Next-Action': actionId,
      Accept: 'text/x-component',
      'Next-Router-State-Tree': tree,
    };
    if (cookie) headers.Cookie = cookie;
    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/manage`, {
      method: 'POST',
      headers,
      body,
      redirect: 'manual',
    });
    const text = await res.text();
    let parsed = null;
    for (const line of text.split('\n')) {
      const i = line.indexOf(':');
      if (i < 0) continue;
      const rest = line.slice(i + 1);
      if (rest.startsWith('{"message"')) {
        parsed = JSON.parse(rest);
        break;
      }
    }
    process.stdout.write(
      `${JSON.stringify({
        httpStatus: res.status,
        location: res.headers.get('location') || '',
        result: parsed,
      })}\n`
    );
  })
  .catch((err) => {
    process.stdout.write(
      `${JSON.stringify({
        httpStatus: 0,
        location: '',
        result: { message: String(err), status: 'error' },
      })}\n`
    );
  });
