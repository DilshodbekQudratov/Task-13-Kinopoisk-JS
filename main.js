checkTheme()
document.getElementById('changeBtn').addEventListener('click', changeTheme);

function changeTheme() {
    let changeBtn = document.getElementById('changeBtn')
    changeBtn.classList.toggle('active')

    let body = document.querySelector('body')
    body.classList.toggle('dark')

    if (body.classList.contains('dark')) {
        // Dark theme
        localStorage.setItem('theme', 'dark')
    }
    else {
        // Light theme
        localStorage.setItem('theme', 'light')
    }
}
function checkTheme() {
    let theme = localStorage.getItem('theme')
    if (theme == 'dark') {
        let changeBtn = document.getElementById('changeBtn')
        changeBtn.classList.add('active')

        let body = document.querySelector('body')
        body.classList.add('dark')
    }
}
// Функция отправки запросов
async function sendRequest(url, method, data) {
    if (method == "POST") {
        let response = await fetch(url, { // fetch - функция отправки запроса по url-адресу, возвращающая обещание отправить запрос, оператор await заставляет JS ждать ответ от сервера и подразумевает, что функция sendRequest() - асинхронная
            method: "POST",
            headers: {
                'Accept': 'application/json', // в каком формате мы получим ответ от сервера
                'Content-Type': 'application/json' // в каком формате отправим информацию на сервер
            },
            body: JSON.stringify(data)
        })

        response = await response.json()
        return response
    } else if (method == "GET") {
        url = url + "?" + new URLSearchParams(data)
        let response = await fetch(url, {
            method: "GET",
            
        })
        response = await response.json()
        return response
    }
}

let searchBtn = document.querySelector('#searchBtn')
searchBtn.addEventListener('click', searchMovie)

let message = document.querySelector(".message")
let loader = document.querySelector(".loader")

async function searchMovie() {
    message.style.display = "none"
    loader.style.display = "block"

    let search = document.getElementsByName('search')[0].value
    let movie = await sendRequest('https://omdbapi.com/', "GET", {
        "apikey": "1d265168",
        "t": search
    })
    
    loader.style.display = "none"
    if (movie.Response == "False") {
        //  Фильм не найден
        message.innerHTML = movie.Error
        message.style.display = "block"
        // alert(movie.Error)
    }      else {
         // Фильм найден
         showMovie(movie)
         searchSimilarMovies(search)
    }
    console.log(movie)
}

function showMovie(movie) {
    let movieTitleh2 = document.querySelector('.movieTitle h2')
    movieTitleh2.innerHTML = movie.Title

    let movieTitle = document.querySelector('.movieTitle')
    movieTitle.style.display = "block"

    let movieDiv = document.querySelector('.movie')
    movieDiv.style.display = "flex"

    let movieImage = document.querySelector('.movieImage')
    movieImage.style.backgroundImage = `url('${movie.Poster}')`

    let movieDesc = document.querySelector('.movieDesc')
    movieDesc.innerHTML = ""

    let dataArray = ["imdbRating", "Actors", "Language", "Country", "Year", "Released", "Plot"]

    dataArray.forEach((key) => {
        movieDesc.innerHTML = movieDesc.innerHTML + `
        <div class="desc">
            <div class="movieLeft">${key}</div>
            <div class="movieRight">${movie[key]}</div>
        </div>`
    });
} 

async function searchSimilarMovies(title) {
    let similarMovies = await sendRequest('https://omdbapi.com/', "GET", {
        "apikey": "1d265168",
        "s": title
    })
    console.log(similarMovies)

    if (similarMovies.Response == "False") {
        //  Похожие фильмы не найдены
        document.querySelector(".similarTitle").style.display = "none"
        document.querySelector(".similarMovies").style.display = "none"
        // alert(movie.Error)
    }      else {
         // Похожие фильмы найдены
         document.querySelector(".similarTitle h2").innerHTML = `Похожих фильмов: ${similarMovies.totalResults}`
         showSimilarMovies(similarMovies.Search)
    }
 
}
function showSimilarMovies(movies) {
    // let similarMoviesDiv = document.querySelector(".similarMovies");
    // similarMoviesDiv.innerHTML = "";
    // movies.forEach(movie => {
    // similarMoviesDiv.innerHTML += `
    //         <div class="similarCard" style="background-image: url('${movie.Poster}')">
    //             <div class="favStar"></div>
    //             <h3>${movie.Title}</h3>
    //         </div>
    //     `;
    // });
    // document.querySelector(".similarTitle").style.display = "block";
    // similarMoviesDiv.style.display = "grid";
    
    const similarTitle = document.querySelector(".similarTitle");
    const similarMoviesDiv = document.querySelector(".similarMovies");
    similarMoviesDiv.innerHTML = ""
    movies.forEach((movie) => {

        const exists = favs.some(fav => fav.imdbid == movie.imdbID); // дает возможность увидеть, какие похожие фильмы были добавлены в избранные при повторном поиске одного и того же фильма
        let favClass = ""
        if (exists) {
            favClass = "active"
        }

    similarMoviesDiv.innerHTML += `
                 <div class="similarCard" style="background-image: url('${movie.Poster}')">
                   <div class="favStar ${favClass}" data-poster="${movie.Poster}" data-title="${movie.Title}" data-imdbid="${movie.imdbID}"></div>
                     <h3>${movie.Title}</h3>
                </div>
            `;
    });
    similarMoviesDiv.style.display = "grid";
    similarTitle.style.display = "block";
    activateFavBtns()
}

function activateFavBtns() {
    document.querySelectorAll('.favStar').forEach((favBtn) => {
        favBtn.addEventListener('click', addToFav)
    })
}

let favs = localStorage.getItem('favs') // создаем массив сохраненных в избранное фильмов
if (!favs) {
    favs = []
    localStorage.setItem('favs', JSON.stringify(favs))
} else {
    favs = JSON.parse(favs)
}
function addToFav() {
        let favBtn = event.target // подсвечивает конкретный элемент, который вызывает функцию addToFav()
        let poster = favBtn.getAttribute('data-poster')
        let title = favBtn.getAttribute('data-title')
        let imdbid = favBtn.getAttribute('data-imdbid')
        const exists = favs.some(fav => fav.imdbid == imdbid);

        if (exists) {
            // Удалить из LS
            favs = favs.filter(fav => fav.imdbid !== imdbid);
            localStorage.setItem('favs', JSON.stringify(favs))
            favBtn.classList.remove('active')
        }
        else {
            // Добавить в LS
            let fav = {imdbid, title, poster}
            favs.push(fav)
            localStorage.setItem('favs',  JSON.stringify(favs))
            favBtn.classList.add('active')
        }
        // console.log(title, imdbid, poster);
        // favBtn.classList.toggle('active')
}

document.querySelector('.FavMoviesBtn').addEventListener('click', getListFav)

function getListFav() {
    let listFav = localStorage.getItem('favs')
    console.log(listFav);
    showFavMovies(listFav)
}

function showFavMovies(favs) {
    console.log(favs)
    let favMovies = document.querySelector('.similarMovies')
    favs = JSON.parse(favs)
    favMovies.innerHTML = ""
    favs.forEach((favs) => {
        
        favMovies.innerHTML += `<div class="similarCard" style="background-image: url('${favs.poster}')">
                   <div class="favStar" data-poster="${favs.poster}" data-title="${favs.title}" data-imdbid="${favs.imdbID}"></div>
                     <h3>${favs.title}</h3>
                </div>`
    });
     document.querySelector(".similarTitle h2").innerHTML = `Избранное`
    favMovies.style.display = "grid";
}
