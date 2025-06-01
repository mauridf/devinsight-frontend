import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Roboto', sans-serif;
    background-color: #E9EDF0; /* Cinza Claro */
    color: #444; /* Cinza escuro */
    line-height: 1.5;
  }

  a {
    text-decoration: none;
    color: #3B84C4; /* Azul Escuro Suave */
    transition: color 0.2s ease;

    &:hover {
      color: #6CB1E1; /* Azul Médio */
    }
  }

  h1, h2, h3, h4, h5, h6 {
    color: #3B84C4; /* Azul Escuro Suave */
    margin-bottom: 1rem;
  }
`;

export default GlobalStyle;