import React from 'react';
import Header from './components/UtilComponents/Header';
import MainContainer from './components/MainContainer';
import Footer from './components/UtilComponents/Footer';

const App = () => {
  return (
    <div className="body">
      <Header />
      <MainContainer />
      <Footer />
    </div>
  );
}

export default App;
