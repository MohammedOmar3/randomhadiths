import React from 'react';
import './App.css';
import axios from 'axios';
import SkeletonLoader from './Components/SkeletonLoader/SkeletonLoader';
import Navbar from './Components/Navbar/Navbar';
import loaderImage from './images/loader.png';

class App extends React.Component {
    state = { 
        hadithid: '',
        hadith: null, // Start as null to display loader initially
        hadithbook: 'bukhari',
        summary: '',
        background: '', // Background image URL
        newBackground: '', // New background image URL for transition
        backgrounds: [], // Store an array of backgrounds
        loading: true, // Indicate loading state for both hadith and background
        isBackgroundLoading: false, // Track background loading for fade-in
    };

    async componentDidMount() {
        await this.loadData();
    }

    loadData = async () => {
        try {
            this.setState({ loading: true });

            // Fetch both background and Hadith data in parallel
            await Promise.all([this.fetchHadith(), this.fetchBackgroundsIfNeeded()]);
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

    fetchBackgroundsIfNeeded = async () => {
        // Fetch 10 new backgrounds if less than 2 are available
        console.log(this.state.backgrounds.length);
        if (this.state.backgrounds.length < 2) {
            await this.fetchBackgrounds();
        } else {
            // Set the next background from the array
            const nextBackground = this.state.backgrounds.shift();
            this.setBackgroundWithFade(nextBackground);
        }
    };

    setBackgroundWithFade = (url) => {
        const img = new Image();
        img.src = url;
    
        // Start fading out the current background
        this.setState({ isBackgroundLoading: true, isHadithReady: false }); // Start fade-out transition
    
        img.onload = () => {
            // Wait for the fade-out to complete before showing the new background and the hadith
            setTimeout(() => {
                this.setState({
                    background: url,  // Set the new background once preloaded
                    isBackgroundLoading: false,  // End fade-in transition
                    isHadithReady: true,  // Mark hadith ready to display
                });
            }, 1000); // Wait 1 second for fade-out before loading new background
        };
    };

    fetchBackgrounds = async () => {
        try {
            const response = await axios.get('https://api.unsplash.com/photos/random', {
                params: {
                    client_id: 'VO8BCIkrpa1nGGlFMJOPPXFN_xtqNqXbz1ZE3HmYw54',
                    query: 'nature, architecture, islam, nature wonders',
                    count: 10 // Fetch 10 new backgrounds
                }
            });
            const backgrounds = response.data.map(img => img.urls.full);
            console.log('Fetched backgrounds:', backgrounds);

            // Set the first background, then add the rest to the state
            const nextBackground = backgrounds.shift(); // Take the first one
            this.setBackgroundWithFade(nextBackground);
            this.setState({ 
                backgrounds: [...this.state.backgrounds, ...backgrounds], // Append new backgrounds to the array
            });
        } catch (error) {
            console.error('Error fetching background:', error);
        }
    };

    fetchHadith = async () => {
        try {
            const response = await axios.get(`https://random-hadith-generator.vercel.app/${this.state.hadithbook}`);
            const hadith = response.data.data;
            console.log(response.data.data.id);
            if (hadith.hadith_english && hadith.hadith_english.length > 500) {
                // Retry fetching if hadith is too long
                await this.fetchHadith();
            } else {
                this.setState({ hadithId: response.data.data.id, hadith });
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
        const { hadith, background, loading, isBackgroundLoading, isHadithReady } = this.state;
    
        return (
            <div className="app">
                <Navbar />
    
                {/* Background wrapper with fade effect */}
                <div 
                    className={`background-wrapper ${isBackgroundLoading ? 'fade-out' : 'fade-in'}`}
                    style={{ backgroundImage: `url(${background})` }}
                ></div>
    
                <div className="overlay"></div>
    
                <div className="card">
                    {/* Only show content when hadith and background are both ready */}
                    {loading || !hadith || !isHadithReady ? (
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
    
                            {hadith.header && <p className="hadith-header">{hadith.header}</p>}
    
                            <div className="content">
                                {hadith.hadith_english && <p>{hadith.hadith_english}</p>}
                            </div>
    
                            {hadith.refno && <p className="hadith-ref">{hadith.refno}</p>}
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
