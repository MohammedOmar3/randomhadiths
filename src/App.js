import React from 'react';
import './App.css';
import axios from 'axios';

class App extends React.Component {
    state = { 
        hadith: {},
        hadithbook: 'bukhari',
        background: ''
    };

    componentDidMount() {
        this.fetchHadith(); // Initial call
    }

    fetchBackground = () => {
        axios.get('https://api.unsplash.com/photos/?client_id=VO8BCIkrpa1nGGlFMJOPPXFN_xtqNqXbz1ZE3HmYw54')
            .then((response) => {
                if (response.data) {
                    const randomIndex = Math.floor(Math.random() * response.data.length);
                    const url = response.data[randomIndex].urls.full;
                    this.setState({ background: url });
                }
            })
            .catch((error) => {
                console.log('Error fetching background:', error);
            });
    };

    fetchHadith = () => {
        axios.get(`https://random-hadith-generator.vercel.app/${this.state.hadithbook}`)
            .then((response) => {
                const hadith = response.data.data;
                // Check if hadith_english is too long
                if (hadith.hadith_english && hadith.hadith_english.length > 500) { // Example length check, adjust as needed
                    this.fetchHadith(); // Retry fetching if too long
                } else {
                    this.setState({ hadith }, () => {
                        this.fetchBackground(); // Fetch new background after hadith is updated
                    });
                }
            })
            .catch((error) => {
                console.log('Error fetching hadith:', error);
            });
    };

    handleBookChange = (event) => {
        this.setState({ hadithbook: event.target.value }, this.fetchHadith);
    };

    toggleDropdown = () => {
        this.setState(prevState => ({ showDropdown: !prevState.showDropdown }));
    };

    render() { 
        const { hadith, background } = this.state;

        return (
            <div 
                className="app"
                style={{
                    backgroundImage: `url(${background})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    height: '100vh',
                    position: 'relative'
                }}
            >
                <div className="overlay"></div>

                <div className="card">
                    <div className="book">
                        {hadith.book && <p>{hadith.book}</p>}
                        {hadith.bookName && <p>{hadith.bookName}</p>}
                        {hadith.chapterName && <p>{hadith.chapterName}</p>}
                    </div>

                    <p className="hadith-header">{hadith.header}</p>

                    <div className="content">
                        {hadith.hadith_english && <p>{hadith.hadith_english}</p>}
                    </div>

                    <p className="hadith-ref">{hadith.refno}</p>

                    <div className="dropdown-container">
                    <button className='next-button' onClick={() => this.fetchHadith()}>Next Hadith</button>
                        <label htmlFor="hadithbook" className="dropdown-label"></label>
                        <select id="hadithbook" className="dropdown" onChange={this.handleBookChange} value={this.state.hadithbook}>
                            <option value="bukhari">Sahih Al-Bukhari</option>
                            <option value="muslim">Sahih Muslim</option>
                            <option value="abudawud">Abu Dawud</option>
                            <option value="ibnmajah">Ibn Majah</option>
                            <option value="tirmidhi">Al-Tirmidhi</option>
                        </select>
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
