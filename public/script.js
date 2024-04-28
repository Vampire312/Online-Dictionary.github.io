document.addEventListener('DOMContentLoaded', () => {
    fetchWordOfTheDay();
    displayLastSearched();
    applyDarkModePreference();
    fetchArticles();
    const lastOpenedArticleIndex = parseInt(localStorage.getItem('lastOpenedArticle'));
    if (!isNaN(lastOpenedArticleIndex)) {
        currentIndex = lastOpenedArticleIndex;
    }
});

function search() {
    const input = document.getElementById('searchInput').value.trim().toLowerCase();
    if (input === '') {
        return;
    }
    clearSuggestions();
    showLoading();
    fetch(`/api/definition?word=${input}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Word not found');
            }
            return response.json();
        })
        .then(data => {
            hideLoading();
            document.getElementById('result').innerHTML = `<strong>${input}</strong>: ${data.definition}`;
            updateLastSearched(input);
        })
        .catch(error => {
            hideLoading();
            document.getElementById('result').innerHTML = `<strong>Error:</strong> ${error.message}`;
        });
}

document.getElementById('searchInput').addEventListener('input', function(event) {
    const input = this.value.trim().toLowerCase();
    const clearSearchInputButton = document.getElementById('clearSearchInput');

    clearSearchInputButton.style.display = input.length > 0 ? 'inline-block' : 'none';

    if (event.inputType !== 'deleteContentBackward') {
        clearResult(); // Clear the result for all input except backspace
    }

    if (input.length === 0) {
        hideResult();
        clearSuggestions();
        return;
    }
    fetch(`/api/suggestions?prefix=${input}`)
        .then(response => response.json())
        .then(data => {
            const suggestions = data.suggestions.map(suggestion => `<div class="suggestion" onclick="loadSuggestion('${suggestion}')">${suggestion}</div>`).join('');
            document.getElementById('suggestions').innerHTML = suggestions;
            showResult();
        })
        .catch(error => console.error('Error:', error));
});

function clearSearchInput() {
    const searchInput = document.getElementById('searchInput');
    searchInput.value = '';
    searchInput.focus();
    clearResult();
}

function hideResult() {
    document.getElementById('result').style.display = 'none';
}

function showResult() {
    document.getElementById('result').style.display = 'block';
}

function loadSuggestion(word) {
    document.getElementById('searchInput').value = word;
    search();
}

document.getElementById('searchInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        clearSuggestions();
        search();
    }
});

function clearSuggestions() {
    document.getElementById('suggestions').innerHTML = '';
}

function showLoading() {
    document.getElementById('loading').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

function fetchWordOfTheDay() {
    fetch('/api/wordOfTheDay')
        .then(response => response.json())
        .then(data => {
            document.getElementById('wordOfTheDayText').innerText = data.word;
            fetch(`/api/definition?word=${data.word}`)
                .then(response => response.json())
                .then(data => {
                    document.getElementById('wordOfTheDayDefinition').innerText = data.definition;
                })
                .catch(error => console.error('Error:', error));
        })
        .catch(error => console.error('Error:', error));
}

function clearLastSearched() {
    localStorage.removeItem('lastSearched');
    displayLastSearched();
    const feedbackMessage = document.createElement('div');
    feedbackMessage.textContent = 'Last searched list cleared.';
    feedbackMessage.classList.add('feedback-message');
    document.body.appendChild(feedbackMessage);
    setTimeout(() => {feedbackMessage.remove();}, 2000);
}

function displayLastSearched() {
    let lastSearched = JSON.parse(localStorage.getItem('lastSearched')) || [];
    const lastSearchedList = document.getElementById('lastSearchedList');
    lastSearchedList.innerHTML = '';
    lastSearched.forEach(word => {
        const li = document.createElement('li');
        li.classList.add('last-searched-item');

        const wordSpan = document.createElement('span');
        wordSpan.textContent = word;
        wordSpan.addEventListener('click', function() {
            document.getElementById('searchInput').value = word;
            search();
        });

        li.appendChild(wordSpan);

        const crossIcon = document.createElement('span');
        crossIcon.innerHTML = '&#10005;'; // Unicode character for cross
        crossIcon.classList.add('clear-item');
        crossIcon.addEventListener('click', function(event) {
            event.stopPropagation(); // Prevent click event from bubbling to the li element
            clearIndividualItem(word);
        });
        li.appendChild(crossIcon);

        lastSearchedList.appendChild(li);
    });
}

function clearIndividualItem(word) {
    let lastSearched = JSON.parse(localStorage.getItem('lastSearched')) || [];
    const index = lastSearched.indexOf(word);
    if (index !== -1) {
        lastSearched.splice(index, 1);
        localStorage.setItem('lastSearched', JSON.stringify(lastSearched));
        displayLastSearched(); // Update the displayed list
    }
}

function updateLastSearched(word) {
    let lastSearched = JSON.parse(localStorage.getItem('lastSearched')) || [];
    const index = lastSearched.indexOf(word);
    if (index !== -1) {
        lastSearched.splice(index, 1);
    }
    lastSearched.unshift(word);
    localStorage.setItem('lastSearched', JSON.stringify(lastSearched));
    displayLastSearched(); // Update the displayed list
}

function toggleDarkMode() {
    const body = document.body;
    const darkModeEnabled = body.classList.toggle('dark-mode');
    document.getElementById('darkModeToggle').innerText = darkModeEnabled ? '🌞' : '🌙';
    setCookie('darkMode', darkModeEnabled.toString(), 30);
}

function applyDarkModePreference() {
    const darkModeCookie = getCookie('darkMode');
    const body = document.body;
    if (darkModeCookie === 'true') {
        body.classList.add('dark-mode');
        document.getElementById('darkModeToggle').innerText = '🌞';
    } else {
        body.classList.remove('dark-mode');
        document.getElementById('darkModeToggle').innerText = '🌙';
    }
}

function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name) {
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookies = decodedCookie.split(';');
    for(let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i];
        while (cookie.charAt(0) === ' ') {
            cookie = cookie.substring(1);
        }
        if (cookie.indexOf(name) === 0) {
            return cookie.substring(name.length + 1);
        }
    }
    return "";
}

document.getElementById('searchInput').addEventListener('keydown', function(event) {
    if (event.key === 'Backspace') {
        clearResult();
    }
});

function clearResult() {
    document.getElementById('result').innerHTML = '';
}

document.addEventListener('click', function(event) {
    const searchInput = document.getElementById('searchInput');
    const suggestions = document.getElementById('suggestions');
    const target = event.target;

    if (target !== searchInput && !searchInput.contains(target) && target !== suggestions && !suggestions.contains(target)) {
        clearSuggestions();
    }
});

let currentIndex = 0;
let articlesData;

function fetchArticles() {
    fetch('/api/articles')
        .then(response => response.json())
        .then(data => {
            articlesData = data;
            showArticle(currentIndex);
        })
        .catch(error => console.error('Error fetching articles:', error));
}

function showArticle(index) {
    const articlesContainer = document.querySelector('.articles-container');
    articlesContainer.innerHTML = '';

    const article = articlesData[index];
    const articleElement = document.createElement('div');
    articleElement.classList.add('article');

    const image = document.createElement('img');
    image.src = article.image;
    image.alt = article.title;
    articleElement.appendChild(image);

    const articleContent = document.createElement('div');
    articleContent.classList.add('article-content');

    const title = document.createElement('h2');
    title.textContent = article.title;
    articleContent.appendChild(title);

    const content = document.createElement('p');
    content.textContent = article.content;
    articleContent.appendChild(content);

    articleElement.appendChild(articleContent);

    articlesContainer.appendChild(articleElement);

    showNavButtons();

    localStorage.setItem('lastOpenedArticle', currentIndex);
}

function showNavButtons() {
    const navButtonsContainer = document.createElement('div');
    navButtonsContainer.classList.add('nav-buttons');

    const articlesContainer = document.querySelector('.articles-container');

    if (currentIndex > 0) {
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Previous';
        prevButton.addEventListener('click', () => {
            currentIndex = Math.max(currentIndex - 1, 0);
            showArticle(currentIndex);
        });
        navButtonsContainer.appendChild(prevButton);
    }

    if (currentIndex < articlesData.length - 1) {
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.addEventListener('click', () => {
            currentIndex = Math.min(currentIndex + 1, articlesData.length - 1);
            showArticle(currentIndex);
        });
        navButtonsContainer.appendChild(nextButton);
    }

    articlesContainer.appendChild(navButtonsContainer);
}
