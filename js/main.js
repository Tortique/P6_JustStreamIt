const url_api = "http://localhost:8000/api/v1/titles/";
const carousel_size = "7"
const categories = [
    {id:'best', url:url_api + "?sort_by=-imdb_score&page_size=" + carousel_size},
    {id:'sci-fi', url:url_api + "?genre=Sci-Fi&sort_by=-votes&page_size=" + carousel_size},
    {id:'depp', url:url_api+ "?actor=Johnny%20Depp&sort_by=-votes&page_size=" + carousel_size},
    {id:'com', url:url_api + "?genre=Comedy&sort_by=-votes&page_size=" + carousel_size}
]
init();

async function init() {
    let url_best = categories[0].url
    let json = await get_json(url_best)
    set_best_movie("bestest", json)
    let carousel;
    for(carousel of categories){
        let id = carousel["id"]
        let endpoint = carousel["url"]
        let json = await get_json(endpoint)
        set_carousel(id,json)
        set_event(id)
    }
}
function set_event(id) {
    const carousel = document.getElementById(id);
    const box = carousel.querySelector(".carouselBox");
    const button_right = carousel.querySelector('.switchRight');
    const button_left = carousel.querySelector('.switchLeft');

    button_right.addEventListener("click", (e) =>  {
        let movieWidth = document.querySelector(".movie").getBoundingClientRect().width;
        let scrollDistance = movieWidth * 4;
        box.scrollBy({
            top: 0,
            left: +scrollDistance,
            behavior: "smooth",
        });
    });

    button_left.addEventListener('click', (e) => {
        let movieWidth = document.querySelector(".movie").getBoundingClientRect().width;
        let scrollDistance = movieWidth * 4;
        box.scrollBy({
            top: 0,
            left: -scrollDistance,
            behavior: "smooth",
        });
    });
}

async function set_best_movie(id,json) {
    let div = document.getElementById(id);

    let movies = json.results;

    let bestest = movies[0].id

    let details = await get_json(url_api + bestest)
    .then((details) => {
      return details
    });

    const movie = new Movie(details);

    let image = movie.image_url;
    let title = movie.title;
    let description = movie.description;

    div.insertAdjacentHTML(
        "beforeend",
        `<div class="bestest"><div class="title"><h1>${title}</h1><button>Lecture</button><p>${description}</p></div>
                <div class="img"><img src='${image}'></div>`
    )
}

function set_carousel(id,json) {
    let carousel = document.getElementById(id);

    movies = json.results;

    let movies_image = carousel.querySelector('.carouselBox');

    let idx = 0;
    for (image_idx in movies) {
        idx++;
        let movie = movies[image_idx];
        let movie_id = movie.id;
        let image = movie.image_url;
        let title = movie.title;
        movies_image.insertAdjacentHTML(
            "beforeend",
            `<div class="movie"><img class='img-${idx}'  src='${image}' alt='${title}' onclick='open_modal(${movie_id});'></div>`
        )
    }
}

async function open_modal(id) {
    let details = await get_json(url_api + id)
    .then((details) => {
      return details
    });

    const movie = new Movie(details);

    const modal = document.getElementById('modal');

    let modal_content = document.querySelector(`.modal-content`);
    modal_content.innerHTML = "";

    let image = document.createElement('img');
    image.className = "modal_image";
    image.src = movie.image_url;
    image.alt = movie.title;
    modal_content.appendChild(image);

    modal.appendChild(modal_content);

    let infos = document.createElement('div')

    let title = document.createElement('h2')
    title.innerText = `${movie.title}`
    infos.appendChild(title)

    let first_infos = document.createElement('h3')
    first_infos.innerText = `${movie.year} - ${movie.imdb_score} - ${movie.duration/60>>0}h${movie.duration % 60}min`;
    first_infos.innerText += `\n Genre : ${movie.genres}`
    infos.appendChild(first_infos)

    let second_infos = document.createElement('p')
    second_infos.innerText = ` Rated : ${movie.rated}`;
    second_infos.innerText += `\n Réalisateur : ${movie.directors} \n Acteurs : ${movie.actors}`;
    infos.appendChild(second_infos)

    let box_office = document.createElement('p')
    box_office.innerText = `Pays : ${movie.country} \n Box-Office : ${movie.box_office} `;
    infos.appendChild(box_office)

    let description = document.createElement('p')
    description.innerText = `Description : \n ${movie.description}`
    infos.appendChild(description)

    modal_content.appendChild(infos)

    var span = document.createElement('span')
    span.className = 'close'
    span.innerHTML = '&times;'
    modal_content.appendChild(span)

    span.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    }

    modal.style.display = "block";
}

async function get_json(url) {
    let api = await fetch(url)
    return await api.json();
}

class Movie {
    constructor(movie) {
        this.id = movie.id;
        this.title = movie.title;
        this.image_url = movie.image_url;
        this.genres = movie.genres
        this.year = movie.year;
        this.rated = movie.rated;
        this.imdb_score = movie.imdb_score;
        this.directors = movie.directors;
        this.actors = movie.actors;
        this.duration = movie.duration;
        this.country = movie.countries;
        if(movie.worldwide_gross_income != null) {
            this.box_office = movie.worldwide_gross_income + " $";
        } else {
            this.box_office = "Non disponible"
        }
        this.description = movie.description;
    }
}
