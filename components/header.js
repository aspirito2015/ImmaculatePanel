class Header extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `
        <div class="header">
            <div class="left">
                <a href="./index.html"><img src="images/icon_large_transparent.png" height="60px"></a>
                <h2>powered by</h2>
                <h3>THE JANKIEST OF CODE</h3>
            </div>
            <div class="right">
                <img src="images/icon_blank.png" width="32px" height="32px">
                <img src="images/icon_blank.png" width="32px" height="32px">
                <img src="images/icon_blank.png" width="32px" height="32px">
            </div>
        </div>
        `;
    }
}

customElements.define('header-component', Header);