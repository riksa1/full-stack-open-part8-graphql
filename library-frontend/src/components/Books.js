import React from "react";

const Books = (props) => {
  if (!props.show || props.booksQuery.loading || !props.booksQuery.data) {
    return null;
  }

  return (
    <div>
      {props.booksQuery.data.specificBooks.length === 0 ? (
        <>
          <h3>No books</h3>
        </>
      ) : (
        <>
          <h2>books</h2>
          <table>
            <tbody>
              <tr>
                <th></th>
                <th>author</th>
                <th>published</th>
              </tr>
              {props.booksQuery.data.specificBooks.map((a) => (
                <tr key={a.title}>
                  <td>{a.title}</td>
                  <td>{a.author.name}</td>
                  <td>{a.published}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {props.genresQuery.data.allGenres.map((genre) => (
            <button id={genre} onClick={() => props.setCurrentGenre(genre)} key={genre}>
              {genre}
            </button>
          ))}
          <button id={"all"} onClick={() => props.setCurrentGenre("all")}>
            all genres
          </button>
        </>
      )}
    </div>
  );
};

export default Books;
