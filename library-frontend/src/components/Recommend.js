import React, { useEffect, useState } from "react";
import { SPECIFIC_BOOKS, FAVORITE_GENRE } from "../queries";
import { useQuery } from "@apollo/client";

const Recommend = (props) => {
  const [genre, setGenre] = useState("");
  const [books, setBooks] = useState([]);

  const genreQuery = useQuery(FAVORITE_GENRE);

  const booksQuery = useQuery(SPECIFIC_BOOKS, {
    variables: { genre: genre },
  });

  useEffect(() => {
    if (genreQuery.data) {
      if (genreQuery.data.me) {
        setGenre(genreQuery.data.me.favoriteGenre);
        booksQuery.refetch({ genre: genreQuery.data.me.favoriteGenre });
      }
    }
  }, [genreQuery.data, booksQuery]);

  useEffect(() => {
    if (booksQuery.data) {
      setBooks(booksQuery.data.specificBooks);
    }
  }, [booksQuery.data]);

  if (!props.show || genreQuery.loading || booksQuery.loading || !props.token) {
    return null;
  }

  return (
    <>
      {books.length === 0 ? (
        <>
          <h3>No books found</h3>
        </>
      ) : (
        <>
          <h2>recommendations</h2>
          <p>books in your favorite genre {genre}</p>
          <table>
            <tbody>
              <tr>
                <th></th>
                <th>author</th>
                <th>published</th>
              </tr>
              {books.map((a) => (
                <tr key={a.title}>
                  <td>{a.title}</td>
                  <td>{a.author.name}</td>
                  <td>{a.published}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </>
  );
};

export default Recommend;
