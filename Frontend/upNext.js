

const api = 'http://127.0.0.1:8000/api/up-next'; // api endpoint for up next books list

let data = [];
let bookIdInEdit = 0;


// button for adding new book to up next list
document.getElementById('add-btn').addEventListener('click', (e) => {
    e.preventDefault();

    const msgDiv = document.getElementById('msg');
    const titleInput = document.getElementById('title');
    const genreInput = document.getElementById('genre');
    const authorInput = document.getElementById('author');
    const startDateInput = document.getElementById('startDate');
    const num_pagesInput = document.getElementById('num_pages');
    const isbnInput = document.getElementById('isbn');
    const publish_dateInput = document.getElementById('publish_date');

    // Validating that user enters title, author, and startdate. The rest can be empty
    if (!titleInput.value || !authorInput.value || !startDateInput.value) {
        msgDiv.innerHTML =
            'Please provide non-empty Title, Author, and StartDate when creating a new up next book';
        return;
    }



    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
        if (xhr.status === 201) {
            const newUpNextBook = JSON.parse(xhr.response);
            data.push(newUpNextBook);
            renderUpNextBooks(data);

            // close modal dialog
            const closeBtn = document.getElementById('close-add-modal');
            closeBtn.click();

            // clean up
            msgDiv.innerHTML = '';
            titleInput.value = '';
            genreInput.value = '';
            authorInput.value = '';
            startDateInput.value = '';
            num_pagesInput.value = "";
            isbnInput.value = "";
            publish_dateInput.value = "";

        }
    };

    xhr.open('POST', api, true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');

    // parseInt source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/parseInt
    xhr.send(JSON.stringify({ title: titleInput.value, genre: genreInput.value, author: authorInput.value, startDate: startDateInput.value, publish_date: publish_dateInput.value, isbn: isbnInput.value, num_pages: parseInt(num_pagesInput.value) }));
});