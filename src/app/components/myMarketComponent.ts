class MyMarketComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.render(); // Call render initially
  }

  static get observedAttributes(): string[] {
    return ['collection'];
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (name === 'collection') {
      this.render(); // Re-render when the attribute changes
    }
  }

  async render(): Promise<void> {
    const shadow = this.shadowRoot!;
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
      const collectionId: string = this.getAttribute('collection') || 'Default';
      const response = await fetch(`https://uncut.network/api/rss?collection_id=${collectionId}`);
      const text = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, 'text/xml');
      const items = xmlDoc.querySelectorAll('item');

      // Extract the first <title> for collection name
      let collectionTitle: string =
        xmlDoc.querySelector('channel > title')?.textContent?.replace(/<!\[CDATA\[(.*?)\]\]>/, '$1') || 'Unknown Collection';

      // Ensure there's only one collection title div
      let collectionTitleDiv = shadow.querySelector<HTMLDivElement>('#collection-title');
      if (!collectionTitleDiv) {
        collectionTitleDiv = document.createElement('div');
        collectionTitleDiv.id = 'collection-title';
        collectionTitleDiv.classList.add('collection-title');
        shadow.prepend(collectionTitleDiv);
      }
      collectionTitleDiv.textContent = `Collection: ${collectionTitle}`;

      // Clear previous content
      const contentDiv = shadow.querySelector<HTMLDivElement>('#content');
      if (contentDiv) {
        contentDiv.innerHTML = '';

        // Create cards for each item
        items.forEach(item => {
          const title: string =
            item.querySelector('title')?.textContent?.replace(/<!\[CDATA\[(.*?)\]\]>/, '$1') || 'No Title';
          const description: string =
            item.querySelector('description')?.textContent?.replace(/<!\[CDATA\[(.*?)\]\]>/, '$1') || 'No Description';
          const imageUrl: string =
            item.querySelector('enclosure')?.getAttribute('url') || 'https://via.placeholder.com/300x200?text=No+Image';
          const link: string = 
            item.querySelector('link')?.textContent?.trim() || '#';

          // Create a clickable card
          const card = document.createElement('a');
          card.classList.add('card');
          card.href = link;
          card.target = "_blank"; // Open in a new tab
          card.rel = "noopener noreferrer"; // Security best practice
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
    } catch (error) {
      const contentDiv = shadow.querySelector<HTMLDivElement>('#content');
      if (contentDiv) {
        contentDiv.innerHTML = '<p>Error loading RSS data.</p>';
      }
    }
  }
}

customElements.define('my-market', MyMarketComponent);
