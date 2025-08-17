import React from 'react';

// A simple and safe markdown-to-JSX parser.
// Supports: **bold**, *italic*, ~strikethrough~, and paragraph breaks.
export const MarkdownRenderer: React.FC<{ text: string, className?: string }> = ({ text, className }) => {
    // Split text into paragraphs based on one or more empty lines.
    // This regex also handles Windows-style line endings (\r\n).
    const paragraphs = text.split(/\r?\n\s*\r?\n/);

    return (
        <div className={className}>
            {paragraphs.map((paragraph, pIndex) => {
                if (!paragraph.trim()) {
                    return null;
                }

                // Within each paragraph, process markdown tokens.
                // The filter(Boolean) is to remove empty strings from the split result.
                const parts = paragraph.split(/(\*\*.*?\*\*|\*.*?\*|~.*?~)/g).filter(Boolean);

                const renderedParts = parts.map((part, index) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={index}>{part.slice(2, -2)}</strong>;
                    }
                    if (part.startsWith('*') && part.endsWith('*')) {
                        return <em key={index}>{part.slice(1, -1)}</em>;
                    }
                    if (part.startsWith('~') && part.endsWith('~')) {
                        return <s key={index}>{part.slice(1, -1)}</s>;
                    }
                    return part;
                });

                return <p key={pIndex}>{renderedParts}</p>;
            })}
        </div>
    );
};