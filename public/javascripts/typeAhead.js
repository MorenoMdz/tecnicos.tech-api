const axios = require('axios');
const dompurify = require('dompurify');

function searchProbResultsHTML(results) {
  return results.problems
    .map((result, i) => {
      return dompurify.sanitize(`
      <a href="/problem/${result.slug}" class="search-result">
        <strong>${result.title}</strong>
      </a>
    `);
    })
    .join('');
}
function searchHwResultsHTML(results) {
  return results.hardwares
    .map((result, i) => {
      return dompurify.sanitize(`
      <a href="/hardware/${result.slug}" class="search-result">
        <strong>${result.name}</strong>, <small> ${result.model}</small>
      </a>
    `);
    })
    .join('');
}

function typeAhead(search) {
  if (!search) return;

  const searchInput = search.querySelector('input[name="search"]');
  const searchResults = search.querySelector('.search-results');

  searchInput.on('input', function() {
    if (!this.value) {
      searchResults.style.display = 'none';
      return;
    }

    searchResults.style.display = 'block';

    axios
      .get(`/api/search?q=${this.value}`)
      .then(res => {
        if (res.data.problems.length && !res.data.hardwares.length) {
          //console.log('prob');
          const html = dompurify.sanitize(searchProbResultsHTML(res.data));
          searchResults.innerHTML = html;
          return;
        } else if (res.data.hardwares.length && !res.data.problems.length) {
          //console.log('hw');
          const html = dompurify.sanitize(searchHwResultsHTML(res.data));
          searchResults.innerHTML = html;
          return;
        } else if (res.data.problems.length && res.data.hardwares.length) {
          //console.log('double');
          const htmlProb = dompurify.sanitize(searchProbResultsHTML(res.data));
          const htmlHw = dompurify.sanitize(searchHwResultsHTML(res.data));
          searchResults.innerHTML = `
            <strong class="border-bottom ml-1">Consoles encontrados:</strong>
            ${htmlHw}
            <strong class="border-bottom ml-1">Defeitos encontrados:</strong>
           ${htmlProb}
          `;
          return;
        }
        // tell nothing came back
        searchResults.innerHTML = dompurify.sanitize(
          `<div class="search-result">No results for ${this.value} found!</div>`
        );
        setTimeout(function() {
          searchResults.style.display = 'none';
        }, 13000);
      })
      .catch(err => {
        console.error(err);
      });
  });
  window.on('keyup', e => {
    if (e.keyCode === 27 && searchResults.style.display === 'block') {
      searchResults.style.display = 'none';
    }
  });
  // Handle keyboard inputs
  searchInput.on('keyup', e => {
    // check for arrows, if do not have these keycodes pressed on keyup
    if (![38, 40, 13].includes(e.keyCode)) {
      return; // skip it
    }
    const activeClass = 'search-result-active';
    const current = search.querySelector(`.${activeClass}`);
    const items = search.querySelectorAll('.search-result');
    let next;
    if (e.keyCode === 40 && current) {
      // if down and we are at some result
      // go to the next sibling or if last go to the first, cycling back up
      next = current.nextElementSibling || items[0];
    } else if (e.keyCode === 40) {
      // if down and not at some result yet
      // go to the first one as it is not on any result yet
      next = items[0];
    } else if (e.keyCode === 38 && current) {
      // if up
      next = current.previousElementSibling || items[items.length - 1];
    } else if (e.keyCode === 38) {
      next = items[items.length - 1];
    } else if (e.keyCode === 13 && current.href) {
      // if enter is hit and is at some result
      window.location = current.href; // go to that actual page (the current href)
      return; // stop it when we hit enter!
    }
    // if there is a current class the remove all active class
    if (current) {
      current.classList.remove(activeClass);
    }
    // if not the add the active class
    next.classList.add(activeClass);
  });
}

module.exports = typeAhead;
