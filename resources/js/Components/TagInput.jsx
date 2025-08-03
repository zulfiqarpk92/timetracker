import React, { useState } from 'react';

export default function TagInput({ tags = [], onChange, placeholder = "Add tags..." }) {
    const [inputValue, setInputValue] = useState('');

    const addTag = (tagText) => {
        const trimmedTag = tagText.trim();
        if (trimmedTag && !tags.includes(trimmedTag)) {
            onChange([...tags, trimmedTag]);
        }
        setInputValue('');
    };

    const removeTag = (indexToRemove) => {
        onChange(tags.filter((_, index) => index !== indexToRemove));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag(inputValue);
        } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
            removeTag(tags.length - 1);
        }
    };

    const handleInputBlur = () => {
        if (inputValue.trim()) {
            addTag(inputValue);
        }
    };

    return (
        <div className="w-full">
            <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag, index) => (
                    <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 text-sm font-medium bg-green-500/20 text-green-300 rounded-md backdrop-blur-xl border border-green-400/30 group hover:bg-green-500/30 transition-all"
                    >
                        {tag}
                        <button
                            type="button"
                            onClick={() => removeTag(index)}
                            className="ml-2 text-green-200 hover:text-red-300 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </span>
                ))}
            </div>
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleInputBlur}
                placeholder={placeholder}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all text-white placeholder-white/50"
            />
            <p className="text-white/50 text-xs mt-2">
                Press Enter or comma to add a tag. Click × to remove tags.
            </p>
        </div>
    );
}
