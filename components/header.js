class Header extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `
        <div class="header">
            <div class="left">
                <a href="./index.html">
                    <picture>
                        <source srcset="images/icon_large_transparent.png" media="(prefers-color-scheme: dark)">
                        <img src="images/icon_large_transparent_alt.png" height="60px"></picture></a>
                <h2 class="hide-on-mobile">powered by</h2>
                <h3 class="hide-on-mobile">THE JANKIEST OF CODE</h3>
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