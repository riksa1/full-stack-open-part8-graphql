import React, { useState } from "react";
import Select from "react-select";

const Authors = (props) => {
  const [born, setBorn] = useState("");
  const [name, setName] = useState(null);

  if (props.authors.loading || !props.show || !props.authors.data) {
    return null;
  }

  var authorNames = props.authors.data.allAuthors.map((a) => {
    return {
      value: a.name,
      label: a.name,
    };
  });

  const changeSelected = (selectedValue) => {
    setName(selectedValue);
  };

  const submit = (e) => {
    e.preventDefault();

    if (born === "" || name === "") {
      alert("You are missing date or name");
    } else {
      props.editAuthor({ variables: { name: name ? name.value : authorNames[0].value, setBornTo: parseInt(born) } });

      setBorn("");
      setName(authorNames[0]);
    }
  };

  return (
    <div>
      {props.authors.data.allAuthors.length === 0 ? (
        <>
          <h3>No authors</h3>
        </>
      ) : (
        <>
          <h2>authors</h2>
          <table>
            <tbody>
              <tr>
                <th></th>
                <th>born</th>
                <th>books</th>
              </tr>
              {props.authors.data.allAuthors.map((a) => (
                <tr key={a.name}>
                  <td>{a.name}</td>
                  <td>{a.born}</td>
                  <td>{a.bookCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {props.token && (
            <>
              <h2>Set birthyear</h2>
              <form onSubmit={submit}>
                <Select options={authorNames} defaultValue={authorNames[0]} value={name !== null ? name : authorNames[0]} onChange={changeSelected} />
                <div>
                  born
                  <input type="number" value={born} onChange={({ target }) => setBorn(target.value)} />
                </div>
                <button type="submit">update author</button>
              </form>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Authors;
