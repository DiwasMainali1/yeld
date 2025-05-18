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
    { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
    { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson" },
    { text: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" },
    { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
    { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
    { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
    { text: "Everything has beauty, but not everyone sees it.", author: "Confucius" },
    { text: "Change your thoughts and you change your world.", author: "Norman Vincent Peale" },
    { text: "Nothing is impossible, the word itself says 'I'm possible'!", author: "Audrey Hepburn" },
    { text: "The journey of a thousand miles begins with one step.", author: "Lao Tzu" },
    { text: "What we think, we become.", author: "Buddha" },
    { text: "Yesterday is not ours to recover, but tomorrow is ours to win or lose.", author: "Lyndon B. Johnson" },
    { text: "The only way to have a friend is to be one.", author: "Ralph Waldo Emerson" },
    { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
    { text: "The purpose of our lives is to be happy.", author: "Dalai Lama" },
    { text: "You must be the change you wish to see in the world.", author: "Mahatma Gandhi" },
    { text: "To succeed in life, you need two things: ignorance and confidence.", author: "Mark Twain" },
    { text: "The harder I work, the luckier I get.", author: "Samuel Goldwyn" },
    { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
    { text: "If you want to lift yourself up, lift up someone else.", author: "Booker T. Washington" },
    { text: "The best revenge is massive success.", author: "Frank Sinatra" },
    { text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
    { text: "Be so good they can't ignore you.", author: "Steve Martin" },
    { text: "The difference between ordinary and extraordinary is that little extra.", author: "Jimmy Johnson" },
    { text: "If you can dream it, you can do it.", author: "Walt Disney" },
    { text: "Success is not in what you have, but who you are.", author: "Bo Bennett" },
    { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
    { text: "Don't count the days, make the days count.", author: "Muhammad Ali" },
    { text: "Vision without action is merely a dream.", author: "Joel A. Barker" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" }
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
        <div className="bg-zinc-950/30 p-6 rounded-2xl border border-zinc-900 shadow-xl mb-4">
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