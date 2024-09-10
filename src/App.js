import React from 'react';
import './App.css';
import axios from 'axios';

class App extends React.Component {
    state = { 
        hadith: {},
        hadithbook: 'bukhari'
     };

    componentDidMount() {
        this.fetchHadith();
    }

    setHadithBook = (book) => {
        this.setState({hadithbook: book});
    }

    fetchHadith = (book) => {
        axios.get('https://random-hadith-generator.vercel.app/' + (book || this.state.hadithbook) )
            .then((response) => {
                console.log('API Response:', response.data); // Log the entire response to inspect it
                // Extract hadith_english from the response
                const hadith = response.data.data;
                this.setState({ hadith });
                console.log('Hadith:', hadith); // Log the hadith value to ensure it's correct
            }).catch((error) => {
                console.log('Error fetching hadith:', error);
            });
    }

    render() { 
        const { hadith } = this.state;
        console.log('Render method, hadith state:', hadith); // Log the hadith value in the render method

        return (
            <div className="app">
                <div className='card'>
                    <div className='book'>
                        <h4>{hadith.book}</h4>
                        <h3>{hadith.bookName}</h3>
                        <h2>{hadith.chapterName}</h2>
                    </div>
                    <div className='content'>
                        <h5>{hadith.header}</h5>
                        <h4>{hadith.hadith_english}</h4>
                    </div>
                    <h5>{hadith.refno}</h5>
                </div>
                <div className="buttons"></div>
                <button className="bukhari" onClick={this.fetchHadith}>
                    <span>Sahih Al-Bukhari</span>
                </button>
                <button className="sahih" onClick={this.fetchHadith}>
                    <span>Sahih Muslim</span>
                </button>
                <button className="dawud" onClick={this.fetchHadith}>
                    <span>Abu Dawud</span>
                </button>
                <button className="majah" onClick={this.fetchHadith}>
                    <span>Ibn Majah</span>
                </button>
                <button className="tirmidhi" onClick={this.fetchHadith}>
                    <span>Al-Tirmidhi</span>
                </button>
            </div>
        );
    }
}

export default App;
