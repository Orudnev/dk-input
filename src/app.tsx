import React, { useEffect, useState } from 'react';
import {
  Routes,
  Route,
  NavigateFunction,
  useNavigate,
  Navigate,
  Link
} from "react-router-dom";


function App() {
  
  useEffect(() => {
  }, []);
  return (
    <div>
      <Routes>
        <Route path={"/"} element={<div>Root</div>} />
        <Route path={"/S1"} element={<div>S1</div>} />
      </Routes> 
    </div>
  );
}

export default App;
