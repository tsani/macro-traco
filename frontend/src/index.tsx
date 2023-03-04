import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import MacroTraco from './components/MacroTraco';
import RecipeEditor from './components/RecipeEditor';
import QuantifiedEditorManager from './components/QuantifiedFoodEditor';

function App() {
  return (
    <>
    <MacroTraco/>
    <RecipeEditor/>
    <QuantifiedEditorManager/>
    </>
  );
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
