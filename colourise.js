'use strict'

const colours = ["#F9DBBD", "#CDC7E5", "#F6A5A2", "#FFF399", "#C4F4C7", "#E8E1EF", "#D9FFF8", "#ADFFE5", "#E6DBD0", "#C7FFDA", "#FCA17D", "#FCD0A1", "#FAFFD8", "#A3F7B5", "#D8B4E2"];

const state = {};

const getElements = () => {
  const iframe = document.querySelectorAll('iframe#microConsole-Logs')[0];

  if (!iframe) return [];

  return [ ...iframe.contentDocument.getElementsByClassName('awsui-table-row') ];
};

const cyrb53 = (str, seed = 0) => {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;

  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }

  h1 = Math.imul(h1 ^ (h1>>>16), 2246822507) ^ Math.imul(h2 ^ (h2>>>13), 3266489909);
  h2 = Math.imul(h2 ^ (h2>>>16), 2246822507) ^ Math.imul(h1 ^ (h1>>>13), 3266489909);

  return 4294967296 * (2097151 & h2) + (h1>>>0);
};

const colouriseRow = (row, colourDate = true) => {
  const match = row.innerHTML.match(/[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}/);

  if (!match) return;

  const id = match[0];

  if (['START', 'END', 'REPORT', 'WARN', 'ERROR'].some(boldCriteria => row.children[2].innerHTML.includes(boldCriteria))) {
    row.style.fontWeight = 'bolder';
  }

  if (row.innerHTML.match(/[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}\sWARN/)) {
    row.children[2].style.color = '#e98e01';
  }

  if (row.innerHTML.match(/[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}\sERROR/)) {
    row.children[2].style.color = '#f7596b';
  }

  if (id && row.children.length > 1) {
    const colour = colours[cyrb53(id) % colours.length]
    row.children[0].style.backgroundColor = colour;
    row.children[1].style.backgroundColor = colourDate ? colour : 'transparent';
  }
};

const colouriseAll = () => {
  const elements = getElements();

  elements.forEach(row => {
    if (row.hasProcessed) return;
    colouriseRow(row);
    row.hasProcessed = true;
  });

  return;
};

const initialise = () => {
  if (!state.tableListener) {
    const iframe = document.querySelectorAll('iframe#microConsole-Logs')[0];

    if (!iframe) return;

    const table = iframe.contentDocument.getElementsByClassName('awsui-table-nowrap')[0];

    if (!table) return;

    table.addEventListener('click', (evt) => {
      const row = evt.path.find(el => el.classList.contains('awsui-table-row'));
      colouriseRow(row, row.classList.contains('awsui-table-row-selected'));
    });

    state.tableListener = true;
  }
};


setInterval(() => {
  initialise();
  colouriseAll();
}, 1000);