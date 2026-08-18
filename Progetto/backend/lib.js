function isLogged() {
    return localStorage.getItem("utente");
}

function checkLogged() {
    if (isLogged()) {
        window.location.href = "bizarre_bites.html";
    }
}

function checkLoggedRistoratore() {
    const utente = localStorage.getItem("utente");
    if (!utente || !JSON.parse(utente).ristoratore) {
        window.location.href = "bizarre_bites.html";
    }
}

function logout() {
    localStorage.removeItem("utente");
    localStorage.removeItem("ristorante");
    const base = getBasePath()
    window.location.href = `${base}bizarre_bites.html`;

}

function getBasePath() {
    const path = window.location.pathname;
    const index = path.indexOf('/frontend/');
    return path.substring(0, index) + '/frontend/';
}

function updateNavbar() {
    const zonaAccount = document.getElementById('zona-account');
    const utente = localStorage.getItem("utente");
    const paginaAttuale = window.location.pathname;
    const base = getBasePath();
    if (!utente && !paginaAttuale.includes("accesso.html") && !paginaAttuale.includes("registrazione.html")) {
        zonaAccount.innerHTML = `
            <a href="${base}accesso.html" class="btn btn-brand rounded-pill px-4">Accedi</a>
`;
    } else if (paginaAttuale.includes("accesso.html") || paginaAttuale.includes("registrazione.html")) {
        zonaAccount.innerHTML = '';
    } else {
        const specialOption = JSON.parse(utente).ristoratore ? `<li><a class="dropdown-item" href="/frontend/ristorante/gestione_ristorante.html">Gestione ristorante</a></li>` : '<li><a class="dropdown-item" href="/frontend/ordini.html">I miei ordini</a></li>';
        const nome = JSON.parse(utente).nome;
        zonaAccount.innerHTML = `
      <div class="dropdown">
        <a class="text-dark text-decoration-none dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
          Ciao, ${nome}
        </a>
        <ul class="dropdown-menu dropdown-menu-end shadow border-0;">
          <li><a class="dropdown-item" href="$profilo.html">Modifica profilo</a></li>
          ${specialOption}
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item text-danger" href="#" onclick="logout()">Esci</a></li>
        </ul>
      </div>
        `;
    }
}

async function caricaNavbar() {
    const base = getBasePath();
    const res = await fetch(`${base}navbar.html`);
    document.getElementById('navbar-container').outerHTML = await res.text();
    document.querySelectorAll('nav [data-href]').forEach(link => {
        link.href = base + link.dataset.href;
    });
    updateNavbar();
}

caricaNavbar().catch(err => {
    console.error("Errore caricamento navbar:", err);
});

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

async function getRistorante() {
    const id = JSON.parse(localStorage.getItem("utente"))._id;

    try {
        const response = await fetch(`http://localhost:3005/user/${id}/ristorante?api_key=1234567`);
        return await response.json();
    } catch (error) {
        console.error('Errore durante il recupero del ristorante:', error);
        return null;
    }
}
