import React from 'react';
import './App.css';
import axios from 'axios';
import SkeletonLoader from './Components/SkeletonLoader/SkeletonLoader';
import Navbar from './Components/Navbar/Navbar';
import loaderImage from './images/loader.png';
import filterIcon from './images/filter.png'; 
import html2canvas from 'html2canvas';

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
        selectedLabels: ['Book', 'Book Name', 'Chapter', 'Header', 'Ref No.'],
        isFlashing: false,
        notification: '',
        fromShareableLink: false,
        watermark: false,
    };

    filterDropdownRef = React.createRef();

    async componentDidMount() {
        const path = window.location.pathname;
        const pathParts = path.split('/').filter(part => part); 

        if (pathParts.length === 2) {
            const [book, id] = pathParts;
            this.setState({ 
                hadithbook: book, 
                hadithid: id,
                fromShareableLink: true
            }, async () => {
                await this.loadData();
                this.cleanUpUrl();
                this.setState({ fromShareableLink: false });
            });
        } else {
            await this.loadData();
        }

        document.addEventListener('mousedown', this.handleClickOutside);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside);
    }

    handleClickOutside = (event) => {
        if (this.filterDropdownRef.current && !this.filterDropdownRef.current.contains(event.target)) {
            this.setState({ filterOpen: false });
        }
    }

    cleanUpUrl = () => {
        const cleanUrl = `${window.location.origin}/`;
        window.history.replaceState(null, '', cleanUrl);
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
            const response = await axios.post(process.env.REACT_APP_OPENAI_API_URL, {
                model: 'gpt-4o-mini',
                prompt: `Summarize this text in 1-3 words: ${text}`,
                max_tokens: 10,
                temperature: 0.5
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
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
        console.log(this.state.backgrounds.length);
        if (this.state.backgrounds.length < 2) {
            await this.fetchBackgrounds();
        } else {
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
            const response = await axios.get(process.env.REACT_APP_UNSPLASH_API_URL, {
                params: {
                    client_id: process.env.REACT_APP_UNSPLASH_API_KEY,
                    query: 'nature, architecture, islam, nature wonders',
                    count: 30 
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
        const { hadithid, hadithbook, fromShareableLink } = this.state;
        try {
            let url = `${process.env.REACT_APP_HADITH_API_URL}/${hadithbook}`;
            console.log('this is the hadith id' + hadithid);
            if (hadithid && fromShareableLink) {
                url += `/${hadithid}`;
            }
            const response = await axios.get(url);
            const hadith = response.data.data;
            console.log(response.data.data.id);
            if (hadith.hadith_english && hadith.hadith_english.length > 500) {
                await this.fetchHadith();
            } else {
                this.setState({ hadithid: hadith.id, hadith });
                this.summarizeText(hadith.hadith_english);
            }
        } catch (error) {
            console.error('Error fetching hadith:', error);
        }
    };

    handleBookChange = async (event) => {
        const newBook = event.target.value;
        this.setState({ hadithbook: newBook, loading: true }, async () => {
            await this.fetchHadith(); 
            await this.fetchBackgroundsIfNeeded();  
            this.setState({ loading: false });
        });
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

    downloadSnapshot = () => {
        const elementsToHide = [
            document.querySelector('.filter-button-container'),
            document.querySelector('.dropdown-container'),
            document.querySelector('.navbar-buttons')
        ];
    
        elementsToHide.forEach(el => {
            if (el) el.classList.add('hide-for-snapshot');
        });
    
        const backgroundWrapper = document.querySelector('.background-wrapper');
        if (backgroundWrapper) {
            backgroundWrapper.style.opacity = '1';
        }
    
        this.setState({ isFlashing: true, watermark: true }, () => {
            setTimeout(() => {
                this.setState({ isFlashing: false });
    
                html2canvas(document.querySelector('.app'), {
                    backgroundColor: null,
                    useCORS: true,
                    scale: 3,
                    width: document.querySelector('.app').offsetWidth,
                    height: document.querySelector('.app').offsetHeight
                }).then(canvas => {
                    const link = document.createElement('a');
                    link.href = canvas.toDataURL('image/png');
                    link.download = `${this.state.hadithbook}_${this.state.hadithid}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
    
                    this.setState({ notification: 'Hadith has been downloaded.' });
                    setTimeout(() => {
                        this.setState({ notification: '', watermark: false });
                    }, 3000);
    
                    elementsToHide.forEach(el => {
                        if (el) el.classList.remove('hide-for-snapshot');
                    });
    
                    if (backgroundWrapper) {
                        backgroundWrapper.style.opacity = '';
                    }
                });
            }, 300);
        });
    };

    copyToClipboard = () => {
        const { hadith, selectedLabels } = this.state;
        let textToCopy = '';
    
        const trimContent = (content) => content ? content.trim() : '';
    
        if (selectedLabels.includes('Book') && hadith?.book) {
            textToCopy += `Book: ${trimContent(hadith.book)}\n`;
        }
        if (selectedLabels.includes('Book Name') && hadith?.bookName) {
            textToCopy += `Book Name: ${trimContent(hadith.bookName)}\n`;
        }
        if (selectedLabels.includes('Chapter') && hadith?.chapterName) {
            textToCopy += `Chapter: ${trimContent(hadith.chapterName)}\n`;
        }
        if (selectedLabels.includes('Header') && hadith?.header) {
            textToCopy += `Header: ${trimContent(hadith.header)}\n`;
        }
        if (selectedLabels.includes('Ref No.') && hadith?.refno) {
            textToCopy += `Ref No.: ${trimContent(hadith.refno)}\n`;
        }
        if (hadith?.hadith_english) {
            textToCopy += `Content: ${trimContent(hadith.hadith_english)}\n`;
        }
    
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                this.setState({ notification: 'Hadith copied to clipboard!' });
                setTimeout(() => this.setState({ notification: '' }), 3000);
            })
            .catch(err => {
                this.setState({ notification: 'Error copying to clipboard' });
                setTimeout(() => this.setState({ notification: '' }), 3000);
            });
    };

    copyLinkToShare = () => {
        const { hadithbook, hadithid } = this.state;
        const shareURL = `${window.location.origin}/${hadithbook}/${hadithid}`;
        
        navigator.clipboard.writeText(shareURL)
            .then(() => {
                this.setState({ notification: 'Hadith shareable URL copied to clipboard!' });
                setTimeout(() => this.setState({ notification: '' }), 3000);
            })
            .catch(err => {
                this.setState({ notification: 'Error copying URL to clipboard' });
                setTimeout(() => this.setState({ notification: '' }), 3000);
            });
    };

    render() {
        const { hadith, background, loading, isBackgroundLoading, isHadithReady, filterOpen, availableLabels, selectedLabels, notification, watermark } = this.state;
    
        return (
            <div className="app">
                <Navbar 
                    onDownload={this.downloadSnapshot}
                    onCopy={this.copyToClipboard}
                    onShare={this.copyLinkToShare}
                 />
    
                {notification && (
                    <div className="notification">
                        {notification}
                    </div>
                )}

                <div 
                    className={`background-wrapper ${isBackgroundLoading ? 'fade-out' : 'fade-in'}`}
                    style={{ backgroundImage: `url(${background})` }}
                ></div>
    
                <div className="overlay"></div>

                <div className={`flash-overlay ${this.state.isFlashing ? 'active' : ''}`}></div> {/* Flash overlay */}
    
                <div className="card">
                    {loading || !hadith || !isHadithReady ? (
                        <div>
                            <SkeletonLoader src={loaderImage} width="200px" height="200px" borderRadius="2px" />
                        </div>
                    ) : (
                        <>
                            <div className="book">
                                {selectedLabels.includes('Book') && hadith.book && hadith.book.trim() !== '' && hadith.book !== 'null' && (
                                    <p>{hadith.book}</p>
                                )}
                                {selectedLabels.includes('Book Name') && hadith.bookName && hadith.bookName.trim() !== '' && hadith.bookName !== 'null' && (
                                    <p>{hadith.bookName}</p>
                                )}
                                {selectedLabels.includes('Chapter') && hadith.chapterName && hadith.chapterName.trim() !== '' && hadith.chapterName !== 'null' && (
                                    <p>{hadith.chapterName}</p>
                                )}
                            </div>
    
                            {selectedLabels.includes('Header') && hadith.header && hadith.header.trim() !== '' && hadith.header !== 'null' && (
                                <p className="hadith-header">{hadith.header}</p>
                            )}
    
                            <div className="content">
                                {hadith.hadith_english && hadith.hadith_english.trim() !== '' && hadith.hadith_english !== 'null' && (
                                    <p>{hadith.hadith_english}</p>
                                )}
                            </div>
                            
                            {selectedLabels.includes('Ref No.') && hadith.refno && hadith.refno.trim() !== '' && hadith.refno !== 'null' && (
                                <p className="hadith-ref">{hadith.refno}</p>
                            )}
                            {watermark && <p className='watermark'>created using nstxo.com</p>}
                        </>
                    )}
    
                    <div className="dropdown-container">
                        <button className='next-button' onClick={ async () => {
                            await this.fetchHadith();
                            await this.fetchBackgroundsIfNeeded();
                        }}>Next Hadith</button>
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
                        <div className="filter-dropdown" ref={this.filterDropdownRef}>
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
