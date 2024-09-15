import React from 'react';
import './App.css';
import axios from 'axios';
import SkeletonLoader from './Components/SkeletonLoader/SkeletonLoader';
import Navbar from './Components/Navbar/Navbar';
import loaderImage from './images/loader.png';

class App extends React.Component {
    state = { 
        hadith: null, // Start as null to display loader initially
        hadithbook: 'bukhari',
        summary: '',
        background: '', // Background image URL
        newBackground: '', // New background image URL for transition
        loading: true, // Indicate loading state
    };

    async componentDidMount() {
        await this.loadData();
    }

    loadData = async () => {
        try {
            this.setState({ loading: true });

            // Fetch both background and Hadith data in parallel
            await Promise.all([this.fetchHadith(), this.fetchBackground()]);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            this.setState({ loading: false });
        }
    }

    summarizeText = async (text) => {
        try {
            const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: 'gpt-4o-mini',
                prompt: `Summarize this text in 1-3 words: ${text}`,
                max_tokens: 10,
                temperature: 0.5
            }, {
                headers: {
                    'Authorization': `Bearer YOUR_API_KEY`, // Replace with your actual API key
                    'Content-Type': 'application/json'
                }
            });
            console.log(response.data.choices[0].text.trim());
            this.setState({ summary: response.data.choices[0].text.trim() });
        } catch (error) {
            console.error('Error summarizing text:', error.response || error);
        }
    };
    
    fetchBackground = async () => {
        try {
            this.setState({ fadeOut: true }); // Trigger fade-out effect
    
            // Wait for the fade-out effect to complete
            await new Promise(resolve => setTimeout(resolve, 1000)); // Match the duration of the CSS transition
    
            const response = await axios.get('https://api.unsplash.com/photos/?client_id=VO8BCIkrpa1nGGlFMJOPPXFN_xtqNqXbz1ZE3HmYw54'); // Replace with your actual Unsplash API client ID
            if (response.data.length > 0) {
                const randomIndex = Math.floor(Math.random() * response.data.length);
                const url = response.data[randomIndex].urls.full;
    
                // Preload the image
                const img = new Image();
                img.src = url;
    
                img.onload = () => {
                    this.setState({ newBackground: url }, () => {
                        this.setState({ background: this.state.newBackground, fadeOut: false }); // Apply new background and trigger fade-in
                    });
                };
            }
        } catch (error) {
            console.error('Error fetching background:', error);
        }
    };

    fetchHadith = async () => {
        try {
            const response = await axios.get(`https://random-hadith-generator.vercel.app/${this.state.hadithbook}`);
            const hadith = response.data.data;
            if (hadith.hadith_english && hadith.hadith_english.length > 500) {
                // Retry fetching if hadith is too long
                await this.fetchHadith();
            } else {
                this.setState({ hadith });
                this.summarizeText(hadith.hadith_english);
            }
        } catch (error) {
            console.error('Error fetching hadith:', error);
        }
    };

    handleBookChange = async (event) => {
        this.setState({ hadithbook: event.target.value, loading: true });
        await this.loadData();
    };

    render() { 
        const { hadith, background, loading } = this.state;
    
        return (
            <div className="app">
                <Navbar />

                <div 
                    className={`background-wrapper ${this.state.fadeOut ? 'fade-out' : 'fade-in'}`}
                    style={{ backgroundImage: `url(${background})` }}
                    // Add a class to trigger fade effect
                ></div>
    
                <div className="overlay"></div>

    
                <div className="card">
                    {loading || !hadith ? (
                        <div>
                            <SkeletonLoader src={loaderImage} width="200px" height="200px" borderRadius="2px" />
                        </div>
                    ) : (
                        <>
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
                        </>
                    )}
                    <div className="dropdown-container">
                        <button className='next-button' onClick={() => this.handleBookChange({ target: { value: this.state.hadithbook } })}>Next Hadith</button>
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
