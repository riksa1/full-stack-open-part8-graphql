import { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { LOGIN } from "../queries";

const Notify = ({ errorMessage }) => {
  if (!errorMessage) {
    return null;
  }
  return <div style={{ color: "red" }}>{errorMessage}</div>;
};

const LoginForm = ({ setToken, show, setPage }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const [login, result] = useMutation(LOGIN, {
    onError: (error) => {
      setError(error.graphQLErrors[0].message);
      setTimeout(() => {
        setError(null);
      }, [5000]);
    },
  });

  useEffect(() => {
    if (result.data) {
      const token = result.data.login.value;
      setToken(token);
      localStorage.setItem("user-token", token);
      setUsername("");
      setPassword("");
      setPage("authors");
    }
  }, [result.data]); // eslint-disable-line

  const submit = async (event) => {
    event.preventDefault();

    login({ variables: { username, password } });
  };

  if (!show) {
    return null;
  }

  return (
    <div>
      <Notify errorMessage={error} />
      <form onSubmit={submit}>
        <div>
          username <input value={username} onChange={({ target }) => setUsername(target.value)} />
        </div>
        <div>
          password <input type="password" value={password} onChange={({ target }) => setPassword(target.value)} />
        </div>
        <button type="submit">login</button>
      </form>
    </div>
  );
};

export default LoginForm;
