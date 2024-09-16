import React from 'react';
import './App.css';
import axios from 'axios';
import SkeletonLoader from './Components/SkeletonLoader/SkeletonLoader';
import Navbar from './Components/Navbar/Navbar';
import loaderImage from './images/loader.png';
import filterIcon from './images/filter.png'; 

class App extends React.Component {
    state = { 
        hadithid: '',
        hadith: null,
        hadithbook: 'bukhari',
        summary: '',
        background: '',
        newBackground: '',
        backgrounds: [],
        loading: true,
        isBackgroundLoading: false,
        isHadithReady: false,
        filterOpen: false, 
        availableLabels: ['Book', 'Book Name', 'Chapter', 'Header', 'Ref No.'], 
        selectedLabels: ['Book', 'Book Name', 'Chapter', 'Header', 'Ref No.'] 
    };

    async componentDidMount() {
        await this.loadData();
    }

    loadData = async () => {
        try {
            this.setState({ loading: true });
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
                    'Authorization': `Bearer YOUR_API_KEY`,
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
    
        this.setState({ isBackgroundLoading: true, isHadithReady: false }); 
    
        img.onload = () => {
            setTimeout(() => {
                this.setState({
                    background: url,  
                    isBackgroundLoading: false,  
                    isHadithReady: true,  
                });
            }, 1000); 
        };
    };

    fetchBackgrounds = async () => {
        try {
            const response = await axios.get('https://api.unsplash.com/photos/random', {
                params: {
                    client_id: 'VO8BCIkrpa1nGGlFMJOPPXFN_xtqNqXbz1ZE3HmYw54',
                    query: 'nature, architecture, islam, nature wonders',
                    count: 10 
                }
            });
            const backgrounds = response.data.map(img => img.urls.full);
            console.log('Fetched backgrounds:', backgrounds);

            const nextBackground = backgrounds.shift(); 
            this.setBackgroundWithFade(nextBackground);
            this.setState({ 
                backgrounds: [...this.state.backgrounds, ...backgrounds], 
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

    toggleFilter = () => {
        this.setState(prevState => ({ filterOpen: !prevState.filterOpen }));
    }

    handleLabelChange = (label) => {
        this.setState(prevState => {
            const { selectedLabels } = prevState;
            const updatedLabels = selectedLabels.includes(label)
                ? selectedLabels.filter(l => l !== label)
                : [...selectedLabels, label];
    
            return { selectedLabels: updatedLabels };
        });
    }

    render() {
        const { hadith, background, loading, isBackgroundLoading, isHadithReady, filterOpen, availableLabels, selectedLabels } = this.state;
    
        return (
            <div className="app">
                <Navbar />
    
                <div 
                    className={`background-wrapper ${isBackgroundLoading ? 'fade-out' : 'fade-in'}`}
                    style={{ backgroundImage: `url(${background})` }}
                ></div>
    
                <div className="overlay"></div>
    
                <div className="card">
                    {loading || !hadith || !isHadithReady ? (
                        <div>
                            <SkeletonLoader src={loaderImage} width="200px" height="200px" borderRadius="2px" />
                        </div>
                    ) : (
                        <>
                            <div className="book">
                                {selectedLabels.includes('Book') && hadith.book && <p>{hadith.book}</p>}
                                {selectedLabels.includes('Book Name') && hadith.bookName && <p>{hadith.bookName}</p>}
                                {selectedLabels.includes('Chapter') && hadith.chapterName && <p>{hadith.chapterName}</p>}
                            </div>
    
                            {selectedLabels.includes('Header') && hadith.header && <p className="hadith-header">{hadith.header}</p>}
    
                            <div className="content">
                                {hadith.hadith_english && <p>{hadith.hadith_english}</p>}
                            </div>
    
                            {selectedLabels.includes('Ref No.') && hadith.refno && <p className="hadith-ref">{hadith.refno}</p>}
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
    
                <div className="filter-button-container">
                    <button className="filter-button" onClick={this.toggleFilter}>
                        <img src={filterIcon} alt="Filter" className="filter-icon" />
                    </button>
    
                    {filterOpen && (
                        <div className="filter-dropdown">
                            {availableLabels.map(label => (
                                <label key={label} className="filter-item">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedLabels.includes(label)} 
                                        onChange={() => this.handleLabelChange(label)} 
                                    />
                                    {label}
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default App;
