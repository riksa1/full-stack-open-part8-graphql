import { useState, useEffect } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import LoginForm from "./components/LoginForm";
import NewBook from "./components/NewBook";
import Recommend from "./components/Recommend";
import { useSubscription, useApolloClient } from "@apollo/client";
import { BOOK_ADDED, SPECIFIC_BOOKS, ALL_GENRES, ALL_AUTHORS, EDIT_AUTHOR } from "./queries";
import { useQuery, useMutation } from "@apollo/client";

const updateCache = (cache, query, addedBook, currentGenre) => {
  const uniqByTitle = (a) => {
    let seen = new Set();
    return a.filter((item) => {
      let k = item.title;
      return seen.has(k) ? false : seen.add(k);
    });
  };
  cache.updateQuery(query, ({ specificBooks }) => {
    if (currentGenre === "all") {
      return {
        specificBooks: uniqByTitle(specificBooks.concat(addedBook)),
      };
    } else {
      return {
        specificBooks: specificBooks,
      };
    }
  });
};

const App = () => {
  const [page, setPage] = useState("authors");
  const [currentGenre, setCurrentGenre] = useState("all");
  const [token, setToken] = useState(null);
  const booksQuery = useQuery(SPECIFIC_BOOKS, {
    variables: { genre: currentGenre },
  });
  const genresQuery = useQuery(ALL_GENRES);
  const authors = useQuery(ALL_AUTHORS);
  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  });
  const client = useApolloClient();

  const logout = () => {
    setToken(null);
    localStorage.clear();
    client.resetStore();
  };

  useEffect(() => {
    booksQuery.refetch({ genre: currentGenre });
    genresQuery.refetch();
    authors.refetch();
  }, [currentGenre, booksQuery, genresQuery, authors]);

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const addedBook = subscriptionData.data.bookAdded;
      window.alert(`${addedBook.title} added`);

      updateCache(client.cache, { query: SPECIFIC_BOOKS, variables: { genre: currentGenre } }, addedBook, currentGenre);

      if (!addedBook.genres.every((r) => genresQuery.data.allGenres.includes(r))) {
        var allgenres = [...addedBook.genres, ...genresQuery.data.allGenres];
        allgenres = allgenres.filter((item, index) => allgenres.indexOf(item) === index);
        client.cache.updateQuery({ query: ALL_GENRES }, ({ allGenres }) => {
          return {
            allGenres: allGenres,
          };
        });
      }
    },
  });

  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        {!token ? (
          <button onClick={() => setPage("login")}>login</button>
        ) : (
          <>
            <button onClick={() => setPage("add")}>add book</button>
            <button onClick={() => setPage("recommend")}>recommend</button>
            <button onClick={() => logout()}>logout</button>
          </>
        )}
      </div>

      <Authors show={page === "authors"} token={token} authors={authors} editAuthor={editAuthor} />

      <Books show={page === "books"} setCurrentGenre={setCurrentGenre} booksQuery={booksQuery} genresQuery={genresQuery} />

      <NewBook show={page === "add"} token={token} />

      <Recommend show={page === "recommend"} token={token} />

      <LoginForm show={page === "login"} setToken={setToken} setPage={setPage} />
    </div>
  );
};

export default App;
