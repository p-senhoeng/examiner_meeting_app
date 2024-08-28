import React from "react";
import '../styles/home.css';

function handleClick(gridNumber) {
    // handle click logic here
}

function Home() {
    return (
        <>
            <div>
                <header>
                    <div className='title'>
                        <img src='https://niwa.co.nz/sites/default/files/Waik_Word_RGB_H.jpg' alt="Waikato University" className='logo' />
                        <h1 className='heading'>Examiner Meeting</h1>
                    </div>
                </header>
            </div>
            <section className="hero">
                <div className="hero-content">
                    <div className="flex-container">
                        <div className="flex-item" onClick={() => handleClick(1)}> <img src={require('../assets/file-csv.png')} alt="CSV File" />Upload CSV</div>
                        <div className="flex-item" onClick={() => handleClick(2)}><img src={require('../assets/review-review.png')} alt="Review" />Review Data</div>
                        <div className="flex-item" onClick={() => handleClick(3)}><img src={require('../assets/Trend Graph.png')} alt="Review" />Visualisation</div>
                    </div>
                </div>
            </section>
            
        </>
    );
}

export default Home;