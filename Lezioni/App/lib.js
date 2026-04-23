const api_key = "995cc3bf239ca2e0c6345391570a3f06";


function cambioPagina() {

    mostraPopolari();
}

function cambioLingua() {
    mostraPopolari();
}

function ottieniLingue() {
    fetch(`https://api.themoviedb.org/3/configuration/languages?api_key=${api_key}`)
        .then(res => res.json())
        .then(res => mostraLingue(res));
}
function mostraLingue(lingue) {
    var select_lingua = document.getElementById('lingua');
    for (var i = 0; lingue.length; i++) {
        nome_lingua = lingue[i].english_name;
        codice_lingua = lingue[i].iso_639_1;
        select_lingua.options[i] = new Option(nome_lingua, codice_lingua);
    }

}
function mostraPopolari() {
    var modello = document.getElementById('modello');
    var body = document.getElementById('body');
    body.innerHTML = "";
    body.append(modello);

    var page = document.getElementById('pagina').value;
    var language = document.getElementById('lingua').value;

    fetch(`https://api.themoviedb.org/3/movie/popular?language=${language}&page=${page}&api_key=${api_key}`)
        .then(res => res.json())
        .then(popolari => {
            for (var i = 0; i < popolari.results.length; i++) {
                var clone = modello.cloneNode(true);
                var film = popolari.results[i];
                // popoliamo la card

                clone.getElementsByClassName('card-title')[0].innerHTML += film.title;
                clone.getElementsByClassName('card-text')[0].innerHTML += film.overview;
                clone.getElementsByTagName('img')[0].src += film.poster_path;
                clone.getElementsByTagName('a')[0].href += `${film.id}&lingua=${language}`;

                clone.classList.remove('d-none');
                clone.id = film.id;
                modello.before(clone);
            }
        });
}

function search() {

    var modello = document.getElementById('modello');
    var body = document.getElementById('body');
    body.innerHTML = "";
    body.append(modello);

    var movie = document.getElementById('ricerca').value;
    var language = document.getElementById('lingua').value;

    fetch(`https://api.themoviedb.org/3/search/movie?query=${movie}&include_adult=false&language=${language}&page=1&api_key=${api_key}`)
        .then(res => res.json())
        .then(ricerca => {
            console.log(ricerca);
            for (var i = 0; i < ricerca.results.length; i++) {
                var clone = modello.cloneNode(true);
                var film = ricerca.results[i];
                // popoliamo la card

                clone.getElementsByClassName('card-title')[0].innerHTML += film.title;
                clone.getElementsByClassName('card-text')[0].innerHTML += film.overview;
                clone.getElementsByTagName('img')[0].src += film.poster_path;
                clone.getElementsByTagName('a')[0].href += `${film.id}&lingua=${language}`;

                clone.classList.remove('d-none');
                clone.id = film.id;
                modello.before(clone);
            }
        });
}


