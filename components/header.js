class Header extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `
        <div class="header">
            <div class="left" href="index.html">
                <a href=".." style="text-decoration: none;">
                    <img src="icon.png" width="32px" height="32px">
                    <h1>IMMACULATE PANEL</h1>
                </a>
                <h2>powered by</h2>
                <h3>THE JANKIEST OF CODE</h3>
            </div>
            <div class="right">
                <img src="icon_blank.png" width="32px" height="32px">
                <img src="icon_blank.png" width="32px" height="32px">
                <img src="icon_blank.png" width="32px" height="32px">
            </div>
        </div>
        `;
    }
}

customElements.define('header-component', Header);