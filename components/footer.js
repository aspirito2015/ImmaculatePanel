class Footer extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `
        <div class="footer" id="footer">
            <h2>Footer</h2>
            <p>Lorem ipsum and all that jazz.</p>
        </div>
        `;
    }
}

customElements.define('footer-component', Footer);