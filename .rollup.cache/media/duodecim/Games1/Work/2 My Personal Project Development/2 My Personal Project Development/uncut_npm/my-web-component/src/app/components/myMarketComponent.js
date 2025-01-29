"use strict";
class MyMarketComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.render(); // Call render initially
    }
    static get observedAttributes() {
        return ['collection'];
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'collection') {
            this.render(); // Re-render when the attribute changes
        }
    }
    async render() {
        const shadow = this.shadowRoot;
        shadow.innerHTML = `
      <style>
        * {
          box-sizing: border-box;
        }

        :host {
          display: block;
          font-family: Arial, sans-serif;
        }

        .grid-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          padding: 20px;
          background-color: #f9f9f9;
          border: 1px solid #ddd;
          border-radius: 10px;
        }

        .card {
          border: 1px solid #ddd;
          border-radius: 10px;
          overflow: hidden;
          background-color: #fff;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease-in-out;
          cursor: pointer;
          text-decoration: none;
          color: inherit;
          display: block;
        }

        .card:hover {
          transform: scale(1.05);
        }

        .card img {
          width: 100%;
          height: auto;
          display: block;
        }

        .card-content {
          padding: 15px;
        }

        .card-content h3 {
          margin: 0 0 10px;
          font-size: 1.2em;
          color: #333;
        }

        .card-content p {
          margin: 0;
          font-size: 1em;
          color: #666;
        }

        .collection-title {
          text-align: center;
          font-size: 1.5em;
          margin-bottom: 20px;
          padding: 10px;
          background-color: #f0f0f0;
          border: 1px solid #ddd;
          border-radius: 10px;
        }
      </style>
      <div>
        <div class="grid-container" id="content">
          <p>Loading data...</p>
        </div>
      </div>
    `;
        try {
            const collectionId = this.getAttribute('collection') || 'Default';
            const response = await fetch(`https://duodecimstudio.ddns.net:3000/get-uncut-collection-by-id/${collectionId}`);
            const data = await response.json();
            const channel = data.rss.channel[0];
            const items = channel.item || [];
            // Extract the collection title
            const collectionTitle = channel.title[0] || 'Unknown Collection';
            // Ensure there's only one collection title div
            let collectionTitleDiv = shadow.querySelector('#collection-title');
            if (!collectionTitleDiv) {
                collectionTitleDiv = document.createElement('div');
                collectionTitleDiv.id = 'collection-title';
                collectionTitleDiv.classList.add('collection-title');
                shadow.prepend(collectionTitleDiv);
            }
            collectionTitleDiv.textContent = `Collection: ${collectionTitle}`;
            // Clear previous content
            const contentDiv = shadow.querySelector('#content');
            if (contentDiv) {
                contentDiv.innerHTML = '';
                // Create cards for each item
                items.forEach((item) => {
                    var _a, _b, _c, _d, _e, _f;
                    const title = ((_a = item.title) === null || _a === void 0 ? void 0 : _a[0]) || 'No Title';
                    const description = ((_b = item.description) === null || _b === void 0 ? void 0 : _b[0]) || 'No Description';
                    const imageUrl = ((_e = (_d = (_c = item.enclosure) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d['$']) === null || _e === void 0 ? void 0 : _e.url) || 'https://via.placeholder.com/300x200?text=No+Image';
                    const link = ((_f = item.link) === null || _f === void 0 ? void 0 : _f[0]) || '#';
                    // Create a clickable card
                    const card = document.createElement('a');
                    card.classList.add('card');
                    card.href = link;
                    card.target = '_blank'; // Open in a new tab
                    card.rel = 'noopener noreferrer'; // Security best practice
                    card.innerHTML = `
            <img src="${imageUrl}" alt="${title}" />
            <div class="card-content">
              <h3>${title}</h3>
              <p>${description}</p>
            </div>
          `;
                    contentDiv.appendChild(card);
                });
            }
        }
        catch (error) {
            const contentDiv = shadow.querySelector('#content');
            if (contentDiv) {
                contentDiv.innerHTML = '<p>Error loading data. Please try again later.</p>';
            }
        }
    }
}
customElements.define('my-market', MyMarketComponent);
//# sourceMappingURL=myMarketComponent.js.map