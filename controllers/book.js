

const Book = require('../models/book')
const moment = require('moment')

// fetch all data
async function index(req, res) {

    try {
        if (!req.session.user) {
            return res.redirect('/auth/sign-in')
        }
        const books = await Book.find({})
        .populate('createdBy', 'username')
        .populate('comments.createdBy', 'username');

        const formattedBook = books.map(book => ({
            ...book.toObject(),
            formattedDate: moment(book.createdAt).fromNow()
        }))
        res.render('books', { title: 'Book List', books: formattedBook })
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal server error');
    }

}

// open a form
function newBook(req, res) {
    res.render('books/new', { title: 'New Book' })
}

async function postBook(req, res) {
    try {
        if (!req.session.user) {
            return res.redirect('/auth/sign-in')
        }
        console.log(req.session.user);

        const newBook = {
            ...req.body,
            createdBy: req.session.user.id
        }
        await Book.create(newBook);
        
        res.status(200).redirect('/books')
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal server error')
    }

}

async function addComment(req, res) {

    try {
        const book = await Book.findById(req.params.id);
        const newComment = {
            ...req.body,
            createdBy: req.session.user.id
        }

        book.comments.push(newComment)
        await book.save()
        res.status(200).redirect('/books')
    } catch (error) {
        console.error('Error adding new comment:', error)
        res.status(500).send('Internal Server Error')
    }

}


async function showBook(req, res) {
    try {
        const book = await Book.findById(req.params.id);
        if (book) {
            res.render('books/show', { title: 'Book Details', book })
        } else {
            res.status(404).render('404/notFound', { title: "Book not found" })
        }
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server internal error')
    }

}


async function editBook(req, res) {
    try {
        const book = await Book.findById(req.params.id);
        if (book) {
            res.render('books/edit', { title: 'Edit Book', book });
        } else {
            res.status(404).render('404/notFound', { title: 'Book Not Found!' })
        }
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Internal Server Error')
    }

}

async function updateBook(req, res) {
    try {
        const bookId = parseInt(req.params.id);
        const { id } = req.params;

        const updatedBook = await Book.findByIdAndUpdate(id, req.body)
        if (updatedBook) {
            res.status(200).redirect(`/books`);
            // res.render('bookUpdated', { title: 'Book Updated', book: books[bookIndex] });
        } else {
            res.status(404).render('404/notFound', { title: 'Book Not Found' });
        }
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Internal Server Error')
    }

}

function deleteBook(req, res) {
    const bookId = parseInt(req.params.id);
    const bookIndex = books.findIndex(book => book.id === bookId);
    if (bookIndex !== -1) {
        books.splice(bookIndex, 1);
    } else {
        res.status(404).render('404/notFound', { title: 'Book Not Found' });
    }
    res.redirect('/books');
}

module.exports = { index, newBook, postBook, editBook, updateBook, showBook, addComment, deleteBook,  }
