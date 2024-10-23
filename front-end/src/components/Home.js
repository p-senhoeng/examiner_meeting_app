import React from "react";
import { useNavigate } from 'react-router-dom';
import '../styles/home.css';
import '../styles/header.css';
import Header from './Header';

function Home() {
  const navigate = useNavigate();

  // Handles the click based on the grid number
  function handleClick(gridNumber) {
    switch (gridNumber) {
      case 1:
        navigate('/upload-csv');
        break;
      case 2:
        navigate('/review-data');
        break;
      case 3:
        navigate('/visualization');
        break;
      default:
        break;
    }
  }

  return (
    <>
      <div>
        <Header />
      </div>
      <section className="hero">
        <div className="hero-content">
          <div className="flex-container">
            <div className="flex-item" onClick={() => handleClick(1)}> 
              <img src={require('../assets/file-csv.png')} alt="CSV File" />
              Upload CSV
            </div>
            <div className="flex-item" onClick={() => handleClick(2)}>
              <img src={require('../assets/review-review.png')} alt="Review" />
              Review Data
            </div>
            <div className="flex-item" onClick={() => handleClick(3)}><img src={require('../assets/Trend Graph.png')} alt="Review" />Visualisation</div>
            
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
