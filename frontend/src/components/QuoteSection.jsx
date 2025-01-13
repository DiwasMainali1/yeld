import React, { useState, useEffect } from 'react';
import { Quote } from 'lucide-react';

const quotes = [
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
    { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
    { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "Everything you can imagine is real.", author: "Pablo Picasso" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" }
];

const QuoteSection = () => {
    const [currentQuote, setCurrentQuote] = useState(quotes[0]);

    useEffect(() => {
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        setCurrentQuote(randomQuote);
    }, []);

    const getNewQuote = () => {
        let newQuote = currentQuote;
        while (newQuote === currentQuote) {
            newQuote = quotes[Math.floor(Math.random() * quotes.length)];
        }
        setCurrentQuote(newQuote);
    };

    return (
        <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-900 shadow-xl mb-4">
            <div className="flex items-center gap-3 mb-4">
                <Quote className="w-5 h-5 text-gray-400" />
                <h3 className="text-gray-200 font-semibold">Daily Motivation</h3>
            </div>
            <p className="text-gray-300 italic mb-2">"{currentQuote.text}"</p>
            <div className="flex justify-between items-center">
                <p className="text-gray-500 text-sm">- {currentQuote.author}</p>
                <button 
                    onClick={getNewQuote}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                    New Quote
                </button>
            </div>
        </div>
    );
};

export default QuoteSection;